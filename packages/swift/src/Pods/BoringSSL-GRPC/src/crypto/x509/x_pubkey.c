/* Copyright (C) 1995-1998 Eric Young (eay@cryptsoft.com)
 * All rights reserved.
 *
 * This package is an SSL implementation written
 * by Eric Young (eay@cryptsoft.com).
 * The implementation was written so as to conform with Netscapes SSL.
 *
 * This library is free for commercial and non-commercial use as long as
 * the following conditions are aheared to.  The following conditions
 * apply to all code found in this distribution, be it the RC4, RSA,
 * lhash, DES, etc., code; not just the SSL code.  The SSL documentation
 * included with this distribution is covered by the same copyright terms
 * except that the holder is Tim Hudson (tjh@cryptsoft.com).
 *
 * Copyright remains Eric Young's, and as such any Copyright notices in
 * the code are not to be removed.
 * If this package is used in a product, Eric Young should be given attribution
 * as the author of the parts of the library used.
 * This can be in the form of a textual message at program startup or
 * in documentation (online or textual) provided with the package.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. All advertising materials mentioning features or use of this software
 *    must display the following acknowledgement:
 *    "This product includes cryptographic software written by
 *     Eric Young (eay@cryptsoft.com)"
 *    The word 'cryptographic' can be left out if the rouines from the library
 *    being used are not cryptographic related :-).
 * 4. If you include any Windows specific code (or a derivative thereof) from
 *    the apps directory (application code) you must include an acknowledgement:
 *    "This product includes software written by Tim Hudson (tjh@cryptsoft.com)"
 *
 * THIS SOFTWARE IS PROVIDED BY ERIC YOUNG ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 *
 * The licence and distribution terms for any publically available version or
 * derivative of this code cannot be changed.  i.e. this code cannot simply be
 * copied and put under another distribution licence
 * [including the GNU Public Licence.] */

#include <openssl_grpc/x509.h>

#include <limits.h>

#include <openssl_grpc/asn1.h>
#include <openssl_grpc/asn1t.h>
#include <openssl_grpc/bytestring.h>
#include <openssl_grpc/err.h>
#include <openssl_grpc/evp.h>
#include <openssl_grpc/mem.h>
#include <openssl_grpc/obj.h>
#include <openssl_grpc/thread.h>

#include "../internal.h"

/* Minor tweak to operation: free up EVP_PKEY */
static int pubkey_cb(int operation, ASN1_VALUE **pval, const ASN1_ITEM *it,
                     void *exarg)
{
    if (operation == ASN1_OP_FREE_POST) {
        X509_PUBKEY *pubkey = (X509_PUBKEY *)*pval;
        EVP_PKEY_free(pubkey->pkey);
    }
    return 1;
}

ASN1_SEQUENCE_cb(X509_PUBKEY, pubkey_cb) = {
        ASN1_SIMPLE(X509_PUBKEY, algor, X509_ALGOR),
        ASN1_SIMPLE(X509_PUBKEY, public_key, ASN1_BIT_STRING)
} ASN1_SEQUENCE_END_cb(X509_PUBKEY, X509_PUBKEY)

IMPLEMENT_ASN1_FUNCTIONS(X509_PUBKEY)

int X509_PUBKEY_set(X509_PUBKEY **x, EVP_PKEY *pkey)
{
    X509_PUBKEY *pk = NULL;
    uint8_t *spki = NULL;
    size_t spki_len;

    if (x == NULL)
        return (0);

    CBB cbb;
    if (!CBB_init(&cbb, 0) ||
        !EVP_marshal_public_key(&cbb, pkey) ||
        !CBB_finish(&cbb, &spki, &spki_len) ||
        spki_len > LONG_MAX) {
        CBB_cleanup(&cbb);
        OPENSSL_PUT_ERROR(X509, X509_R_PUBLIC_KEY_ENCODE_ERROR);
        goto error;
    }

    const uint8_t *p = spki;
    pk = d2i_X509_PUBKEY(NULL, &p, (long)spki_len);
    if (pk == NULL || p != spki + spki_len) {
        OPENSSL_PUT_ERROR(X509, X509_R_PUBLIC_KEY_DECODE_ERROR);
        goto error;
    }

    OPENSSL_free(spki);
    X509_PUBKEY_free(*x);
    *x = pk;

    return 1;
 error:
    X509_PUBKEY_free(pk);
    OPENSSL_free(spki);
    return 0;
}

/* g_pubkey_lock is used to protect the initialisation of the |pkey| member of
 * |X509_PUBKEY| objects. Really |X509_PUBKEY| should have a |CRYPTO_once_t|
 * inside it for this, but |CRYPTO_once_t| is private and |X509_PUBKEY| is
 * not. */
static struct CRYPTO_STATIC_MUTEX g_pubkey_lock = CRYPTO_STATIC_MUTEX_INIT;

EVP_PKEY *X509_PUBKEY_get(X509_PUBKEY *key)
{
    EVP_PKEY *ret = NULL;
    uint8_t *spki = NULL;

    if (key == NULL)
        goto error;

    CRYPTO_STATIC_MUTEX_lock_read(&g_pubkey_lock);
    if (key->pkey != NULL) {
        CRYPTO_STATIC_MUTEX_unlock_read(&g_pubkey_lock);
        EVP_PKEY_up_ref(key->pkey);
        return key->pkey;
    }
    CRYPTO_STATIC_MUTEX_unlock_read(&g_pubkey_lock);

    /* Re-encode the |X509_PUBKEY| to DER and parse it. */
    int spki_len = i2d_X509_PUBKEY(key, &spki);
    if (spki_len < 0) {
        goto error;
    }
    CBS cbs;
    CBS_init(&cbs, spki, (size_t)spki_len);
    ret = EVP_parse_public_key(&cbs);
    if (ret == NULL || CBS_len(&cbs) != 0) {
        OPENSSL_PUT_ERROR(X509, X509_R_PUBLIC_KEY_DECODE_ERROR);
        goto error;
    }

    /* Check to see if another thread set key->pkey first */
    CRYPTO_STATIC_MUTEX_lock_write(&g_pubkey_lock);
    if (key->pkey) {
        CRYPTO_STATIC_MUTEX_unlock_write(&g_pubkey_lock);
        EVP_PKEY_free(ret);
        ret = key->pkey;
    } else {
        key->pkey = ret;
        CRYPTO_STATIC_MUTEX_unlock_write(&g_pubkey_lock);
    }

    OPENSSL_free(spki);
    EVP_PKEY_up_ref(ret);
    return ret;

 error:
    OPENSSL_free(spki);
    EVP_PKEY_free(ret);
    return NULL;
}

/*
 * Now two pseudo ASN1 routines that take an EVP_PKEY structure and encode or
 * decode as X509_PUBKEY
 */

EVP_PKEY *d2i_PUBKEY(EVP_PKEY **a, const unsigned char **pp, long length)
{
    X509_PUBKEY *xpk;
    EVP_PKEY *pktmp;
    xpk = d2i_X509_PUBKEY(NULL, pp, length);
    if (!xpk)
        return NULL;
    pktmp = X509_PUBKEY_get(xpk);
    X509_PUBKEY_free(xpk);
    if (!pktmp)
        return NULL;
    if (a) {
        EVP_PKEY_free(*a);
        *a = pktmp;
    }
    return pktmp;
}

int i2d_PUBKEY(const EVP_PKEY *a, unsigned char **pp)
{
    X509_PUBKEY *xpk = NULL;
    int ret;
    if (!a)
        return 0;
    if (!X509_PUBKEY_set(&xpk, (EVP_PKEY *)a))
        return 0;
    ret = i2d_X509_PUBKEY(xpk, pp);
    X509_PUBKEY_free(xpk);
    return ret;
}

/*
 * The following are equivalents but which return RSA and DSA keys
 */
RSA *d2i_RSA_PUBKEY(RSA **a, const unsigned char **pp, long length)
{
    EVP_PKEY *pkey;
    RSA *key;
    const unsigned char *q;
    q = *pp;
    pkey = d2i_PUBKEY(NULL, &q, length);
    if (!pkey)
        return NULL;
    key = EVP_PKEY_get1_RSA(pkey);
    EVP_PKEY_free(pkey);
    if (!key)
        return NULL;
    *pp = q;
    if (a) {
        RSA_free(*a);
        *a = key;
    }
    return key;
}

int i2d_RSA_PUBKEY(const RSA *a, unsigned char **pp)
{
    EVP_PKEY *pktmp;
    int ret;
    if (!a)
        return 0;
    pktmp = EVP_PKEY_new();
    if (!pktmp) {
        OPENSSL_PUT_ERROR(X509, ERR_R_MALLOC_FAILURE);
        return 0;
    }
    EVP_PKEY_set1_RSA(pktmp, (RSA *)a);
    ret = i2d_PUBKEY(pktmp, pp);
    EVP_PKEY_free(pktmp);
    return ret;
}

#ifndef OPENSSL_NO_DSA
DSA *d2i_DSA_PUBKEY(DSA **a, const unsigned char **pp, long length)
{
    EVP_PKEY *pkey;
    DSA *key;
    const unsigned char *q;
    q = *pp;
    pkey = d2i_PUBKEY(NULL, &q, length);
    if (!pkey)
        return NULL;
    key = EVP_PKEY_get1_DSA(pkey);
    EVP_PKEY_free(pkey);
    if (!key)
        return NULL;
    *pp = q;
    if (a) {
        DSA_free(*a);
        *a = key;
    }
    return key;
}

int i2d_DSA_PUBKEY(const DSA *a, unsigned char **pp)
{
    EVP_PKEY *pktmp;
    int ret;
    if (!a)
        return 0;
    pktmp = EVP_PKEY_new();
    if (!pktmp) {
        OPENSSL_PUT_ERROR(X509, ERR_R_MALLOC_FAILURE);
        return 0;
    }
    EVP_PKEY_set1_DSA(pktmp, (DSA *)a);
    ret = i2d_PUBKEY(pktmp, pp);
    EVP_PKEY_free(pktmp);
    return ret;
}
#endif

EC_KEY *d2i_EC_PUBKEY(EC_KEY **a, const unsigned char **pp, long length)
{
    EVP_PKEY *pkey;
    EC_KEY *key;
    const unsigned char *q;
    q = *pp;
    pkey = d2i_PUBKEY(NULL, &q, length);
    if (!pkey)
        return (NULL);
    key = EVP_PKEY_get1_EC_KEY(pkey);
    EVP_PKEY_free(pkey);
    if (!key)
        return (NULL);
    *pp = q;
    if (a) {
        EC_KEY_free(*a);
        *a = key;
    }
    return (key);
}

int i2d_EC_PUBKEY(const EC_KEY *a, unsigned char **pp)
{
    EVP_PKEY *pktmp;
    int ret;
    if (!a)
        return (0);
    if ((pktmp = EVP_PKEY_new()) == NULL) {
        OPENSSL_PUT_ERROR(X509, ERR_R_MALLOC_FAILURE);
        return (0);
    }
    EVP_PKEY_set1_EC_KEY(pktmp, (EC_KEY *)a);
    ret = i2d_PUBKEY(pktmp, pp);
    EVP_PKEY_free(pktmp);
    return (ret);
}

int X509_PUBKEY_set0_param(X509_PUBKEY *pub, const ASN1_OBJECT *aobj,
                           int ptype, void *pval,
                           unsigned char *penc, int penclen)
{
    if (!X509_ALGOR_set0(pub->algor, aobj, ptype, pval))
        return 0;
    if (penc) {
        if (pub->public_key->data)
            OPENSSL_free(pub->public_key->data);
        pub->public_key->data = penc;
        pub->public_key->length = penclen;
        /* Set number of unused bits to zero */
        pub->public_key->flags &= ~(ASN1_STRING_FLAG_BITS_LEFT | 0x07);
        pub->public_key->flags |= ASN1_STRING_FLAG_BITS_LEFT;
    }
    return 1;
}

int X509_PUBKEY_get0_param(ASN1_OBJECT **ppkalg,
                           const unsigned char **pk, int *ppklen,
                           X509_ALGOR **pa, X509_PUBKEY *pub)
{
    if (ppkalg)
        *ppkalg = pub->algor->algorithm;
    if (pk) {
        *pk = pub->public_key->data;
        *ppklen = pub->public_key->length;
    }
    if (pa)
        *pa = pub->algor;
    return 1;
}
