var p;
var ca = function (a) {
  function b(f) {
    return 48 > f ? f === 36 : 58 > f ? true : 65 > f ? false : 91 > f ? true : 97 > f ? f === 95 : 123 > f ? true : 170 <= f && Jc.test(String.fromCharCode(f));
  }
  function d(f) {
    return 65 > f ? f === 36 : 91 > f ? true : 97 > f ? f === 95 : 123 > f ? true : 170 <= f && Pb.test(String.fromCharCode(f));
  }
  function c(f, g) {
    var l = r;
    for (var n = 1, w = 0;;) {
      Sa.lastIndex = w;
      var J = Sa.exec(l);
      if (J && J.index < f) ++n, w = J.index + J[0].length;else break;
    }
    l = {
      line: n,
      ab: f - w
    };
    g += " (" + l.line + ":" + l.ab + ")";
    g = new SyntaxError(g);
    g.j = f;
    g.X = l;
    g.o = m;
    throw g;
  }
  function e(f) {
    f = f.split(" ");
    for (var g = Object.create(null), l = 0; l < f.length; l++) g[f[l]] = true;
    return function (n) {
      return g[n] || false;
    };
  }
  function h() {
    this.line = la;
    this.ab = m - X;
  }
  function k(f, g) {
    oa = m;
    z.C && (cb = new h());
    x = f;
    C();
    T = g;
    ya = f.m;
  }
  function q() {
    for (var f = m, g = z.va && z.C && new h(), l = r.charCodeAt(m += 2); m < pa && l !== 10 && l !== 13 && l !== 8232 && l !== 8233;) ++m, l = r.charCodeAt(m);
    z.va && z.va(false, r.slice(f + 2, m), f, m, g, z.C && new h());
  }
  function C() {
    for (; m < pa;) {
      var f = r.charCodeAt(m);
      if (f === 32) ++m;else if (f === 13) ++m, f = r.charCodeAt(m), f === 10 && ++m, z.C && (++la, X = m);else if (f === 10 || f === 8232 || f === 8233) ++m, z.C && (++la, X = m);else if (8 < f && 14 > f) ++m;else if (f === 47) {
        if (f = r.charCodeAt(m + 1), f === 42) {
          f = void 0;
          var g = z.va && z.C && new h(),
            l = m,
            n = r.indexOf("*/", m += 2);
          n === -1 && c(m - 2, "Unterminated comment");
          m = n + 2;
          if (z.C) for (Sa.lastIndex = l; (f = Sa.exec(r)) && f.index < m;) ++la, X = f.index + f[0].length;
          z.va && z.va(true, r.slice(l + 2, n), l, m, g, z.C && new h());
        } else if (f === 47) q();else break;
      } else if (f === 160) ++m;else if (5760 <= f && Kc.test(String.fromCharCode(f))) ++m;else break;
    }
  }
  function U(f) {
    switch (f) {
      case 46:
        f = r.charCodeAt(m + 1);
        48 <= f && 57 >= f ? Qb(true) : (++m, k(Rb));
        return;
      case 40:
        return ++m, k(Y);
      case 41:
        return ++m, k(W);
      case 59:
        return ++m, k(Z);
      case 44:
        return ++m, k(ha);
      case 91:
        return ++m, k(db);
      case 93:
        return ++m, k(eb);
      case 123:
        return ++m, k(za);
      case 125:
        return ++m, k(qa);
      case 58:
        return ++m, k(Aa);
      case 63:
        return ++m, k(Sb);
      case 48:
        if (f = r.charCodeAt(m + 1), f === 120 || f === 88) {
          m += 2;
          f = Ba(16);
          f === null && c(I + 2, "Expected hexadecimal number");
          d(r.charCodeAt(m)) && c(m, "Identifier directly after number");
          k(Ca, f);
          return;
        }
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        return Qb(false);
      case 34:
      case 39:
        m++;
        for (var g = "";;) {
          m >= pa && c(I, "Unterminated string constant");
          var l = r.charCodeAt(m);
          if (l === f) {
            ++m;
            k(Ta, g);
            break;
          }
          if (l === 92) {
            l = r.charCodeAt(++m);
            var n = /^[0-7]+/.exec(r.slice(m, m + 3));
            for (n && (n = n[0]); n && 255 < parseInt(n, 8);) n = n.slice(0, -1);
            n === "0" && (n = null);
            ++m;
            if (n) S && c(m - 2, "Octal literal in strict mode"), g += String.fromCharCode(parseInt(n, 8)), m += n.length - 1;else switch (l) {
              case 110:
                g += "\n";
                break;
              case 114:
                g += "\r";
                break;
              case 120:
                g += String.fromCharCode(Ua(2));
                break;
              case 117:
                g += String.fromCharCode(Ua(4));
                break;
              case 85:
                g += String.fromCharCode(Ua(8));
                break;
              case 116:
                g += "	";
                break;
              case 98:
                g += "\b";
                break;
              case 118:
                g += "\v";
                break;
              case 102:
                g += "\f";
                break;
              case 48:
                g += "\0";
                break;
              case 13:
                r.charCodeAt(m) === 10 && ++m;
              case 10:
                z.C && (X = m, ++la);
                break;
              default:
                g += String.fromCharCode(l);
            }
          } else l !== 13 && l !== 10 && l !== 8232 && l !== 8233 || c(I, "Unterminated string constant"), g += String.fromCharCode(l), ++m;
        }
        return;
      case 47:
        f = r.charCodeAt(m + 1);
        ya ? (++m, Tb()) : f === 61 ? F(ma, 2) : F(Ub, 1);
        return;
      case 37:
      case 42:
        r.charCodeAt(m + 1) === 61 ? F(ma, 2) : F(Lc, 1);
        return;
      case 124:
      case 38:
        g = r.charCodeAt(m + 1);
        g === f ? F(f === 124 ? Vb : Wb, 2) : g === 61 ? F(ma, 2) : F(f === 124 ? Mc : Nc, 1);
        return;
      case 94:
        r.charCodeAt(m + 1) === 61 ? F(ma, 2) : F(Oc, 1);
        return;
      case 43:
      case 45:
        g = r.charCodeAt(m + 1);
        g === f ? g === 45 && r.charCodeAt(m + 2) === 62 && Va.test(r.slice(ia, m)) ? (m += 3, q(), C(), N()) : F(Pc, 2) : g === 61 ? F(ma, 2) : F(Qc, 1);
        return;
      case 60:
      case 62:
        g = r.charCodeAt(m + 1);
        l = 1;
        g === f ? (l = f === 62 && r.charCodeAt(m + 2) === 62 ? 3 : 2, r.charCodeAt(m + l) === 61 ? F(ma, l + 1) : F(Rc, l)) : g === 33 && f === 60 && r.charCodeAt(m + 2) === 45 && r.charCodeAt(m + 3) === 45 ? (m += 4, q(), C(), N()) : (g === 61 && (l = r.charCodeAt(m + 2) === 61 ? 3 : 2), F(Sc, l));
        return;
      case 61:
      case 33:
        r.charCodeAt(m + 1) === 61 ? F(Tc, r.charCodeAt(m + 2) === 61 ? 3 : 2) : F(f === 61 ? Xb : Yb, 1);
        return;
      case 126:
        return F(Yb, 1);
    }
    return false;
  }
  function N(f) {
    f ? m = I + 1 : I = m;
    z.C && (fb = new h());
    if (f) return Tb();
    if (m >= pa) return k(gb);
    f = r.charCodeAt(m);
    if (d(f) || f === 92) return Zb();
    if (U(f) === false) {
      f = String.fromCharCode(f);
      if (f === "\\" || Pb.test(f)) return Zb();
      c(m, "Unexpected character '" + f + "'");
    }
  }
  function F(f, g) {
    var l = r.slice(m, m + g);
    m += g;
    k(f, l);
  }
  function Tb() {
    for (var f, g, l = m;;) {
      m >= pa && c(l, "Unterminated regexp");
      var n = r.charAt(m);
      Va.test(n) && c(l, "Unterminated regexp");
      if (f) f = false;else {
        if (n === "[") g = true;else if (n === "]" && g) g = false;else if (n === "/" && !g) break;
        f = n === "\\";
      }
      ++m;
    }
    f = r.slice(l, m);
    ++m;
    (g = $b()) && !/^[gmi]*$/.test(g) && c(l, "Invalid regexp flag");
    try {
      var w = new RegExp(f, g);
    } catch (J) {
      throw J instanceof SyntaxError && c(l, J.message), J;
    }
    k(ac, w);
  }
  function Ba(f, g) {
    for (var l = m, n = 0, w = g === void 0 ? Infinity : g, J = 0; J < w; ++J) {
      var P = r.charCodeAt(m);
      P = 97 <= P ? P - 97 + 10 : 65 <= P ? P - 65 + 10 : 48 <= P && 57 >= P ? P - 48 : Infinity;
      if (P >= f) break;
      ++m;
      n = n * f + P;
    }
    return m === l || g !== void 0 && m - l !== g ? null : n;
  }
  function Qb(f) {
    var g = m,
      l = false,
      n = r.charCodeAt(m) === 48;
    f || Ba(10) !== null || c(g, "Invalid number");
    r.charCodeAt(m) === 46 && (++m, Ba(10), l = true);
    f = r.charCodeAt(m);
    if (f === 69 || f === 101) f = r.charCodeAt(++m), f !== 43 && f !== 45 || ++m, Ba(10) === null && c(g, "Invalid number"), l = true;
    d(r.charCodeAt(m)) && c(m, "Identifier directly after number");
    f = r.slice(g, m);
    var w;
    l ? w = parseFloat(f) : n && f.length !== 1 ? /[89]/.test(f) || S ? c(g, "Invalid number") : w = parseInt(f, 8) : w = parseInt(f, 10);
    k(Ca, w);
  }
  function Ua(f) {
    f = Ba(16, f);
    f === null && c(I, "Bad character escape sequence");
    return f;
  }
  function $b() {
    ra = false;
    for (var f, g = true, l = m;;) {
      var n = r.charCodeAt(m);
      if (b(n)) ra && (f += r.charAt(m)), ++m;else if (n === 92) {
        ra || (f = r.slice(l, m));
        ra = true;
        r.charCodeAt(++m) !== 117 && c(m, "Expecting Unicode escape sequence \\uXXXX");
        ++m;
        n = Ua(4);
        var w = String.fromCharCode(n);
        w || c(m - 1, "Invalid Unicode escape");
        (g ? d(n) : b(n)) || c(m - 4, "Invalid Unicode escape");
        f += w;
      } else break;
      g = false;
    }
    return ra ? f : r.slice(l, m);
  }
  function Zb() {
    var f = $b(),
      g = sa;
    !ra && Uc(f) && (g = Vc[f]);
    k(g, f);
  }
  function B() {
    hb = I;
    ia = oa;
    ib = cb;
    N();
  }
  function jb(f) {
    S = f;
    m = I;
    if (z.C) for (; m < X;) X = r.lastIndexOf("\n", X - 2) + 1, --la;
    C();
    N();
  }
  function bc() {
    this.type = null;
    this.start = I;
    this.end = null;
  }
  function cc() {
    this.start = fb;
    this.end = null;
    kb && (this.source = kb);
  }
  function L() {
    var f = new bc();
    z.C && (f.X = new cc());
    z.vb && (f.sourceFile = z.vb);
    z.Xa && (f.j = [I, 0]);
    return f;
  }
  function ja(f) {
    var g = new bc();
    g.start = f.start;
    z.C && (g.X = new cc(), g.X.start = f.X.start);
    z.Xa && (g.j = [f.j[0], 0]);
    return g;
  }
  function y(f, g) {
    f.type = g;
    f.end = ia;
    z.C && (f.X.end = ib);
    z.Xa && (f.j[1] = ia);
    return f;
  }
  function lb(f) {
    return f.type === "ExpressionStatement" && f.la.type === "Literal" && f.la.value === "use strict";
  }
  function E(f) {
    return x === f ? (B(), true) : false;
  }
  function Wa() {
    return !z.fc && (x === gb || x === qa || Va.test(r.slice(ia, I)));
  }
  function na() {
    E(Z) || Wa() || aa();
  }
  function G(f) {
    x === f ? B() : aa();
  }
  function aa() {
    c(I, "Unexpected token");
  }
  function Xa(f) {
    f.type !== "Identifier" && f.type !== "MemberExpression" && c(f.start, "Assigning to rvalue");
    S && f.type === "Identifier" && Ya(f.name) && c(f.start, "Assigning to " + f.name + " in strict mode");
  }
  function V() {
    (x === Ub || x === ma && T === "/=") && N(true);
    var f = x,
      g = L();
    switch (f) {
      case mb:
      case dc:
        B();
        var l = f === mb;
        E(Z) || Wa() ? g.label = null : x !== sa ? aa() : (g.label = ba(), na());
        for (var n = 0; n < H.length; ++n) {
          var w = H[n];
          if (g.label === null || w.name === g.label.name) {
            if (w.kind !== null && (l || w.kind === "loop")) break;
            if (g.label && l) break;
          }
        }
        n === H.length && c(g.start, "Unsyntactic " + f.l);
        return y(g, l ? "BreakStatement" : "ContinueStatement");
      case ec:
        return B(), na(), y(g, "DebuggerStatement");
      case fc:
        return B(), H.push(nb), g.body = V(), H.pop(), G(ob), g.test = Da(), na(), y(g, "DoWhileStatement");
      case gc:
        B();
        H.push(nb);
        G(Y);
        if (x === Z) return pb(g, null);
        if (x === qb) return f = L(), B(), hc(f, true), y(f, "VariableDeclaration"), f.fa.length === 1 && E(Za) ? ic(g, f) : pb(g, f);
        f = O(false, true);
        return E(Za) ? (Xa(f), ic(g, f)) : pb(g, f);
      case rb:
        return B(), sb(g, true);
      case jc:
        return B(), g.test = Da(), g.da = V(), g.alternate = E(kc) ? V() : null, y(g, "IfStatement");
      case lc:
        return Ea || z.Ib || c(I, "'return' outside of function"), B(), E(Z) || Wa() ? g.K = null : (g.K = O(), na()), y(g, "ReturnStatement");
      case tb:
        B();
        g.Qb = Da();
        g.tb = [];
        G(za);
        for (H.push(Wc); x !== qa;) x === ub || x === mc ? (f = x === ub, n && y(n, "SwitchCase"), g.tb.push(n = L()), n.da = [], B(), f ? n.test = O() : (l && c(hb, "Multiple default clauses"), l = true, n.test = null), G(Aa)) : (n || aa(), n.da.push(V()));
        n && y(n, "SwitchCase");
        B();
        H.pop();
        return y(g, "SwitchStatement");
      case nc:
        return B(), Va.test(r.slice(ia, I)) && c(ia, "Illegal newline after throw"), g.K = O(), na(), y(g, "ThrowStatement");
      case oc:
        return B(), g.block = Fa(), g.Ea = null, x === pc && (f = L(), B(), G(Y), f.Ua = ba(), S && Ya(f.Ua.name) && c(f.Ua.start, "Binding " + f.Ua.name + " in strict mode"), G(W), f.body = Fa(), g.Ea = y(f, "CatchClause")), g.fb = E(qc) ? Fa() : null, g.Ea || g.fb || c(g.start, "Missing catch or finally clause"), y(g, "TryStatement");
      case qb:
        return B(), hc(g), na(), y(g, "VariableDeclaration");
      case ob:
        return B(), g.test = Da(), H.push(nb), g.body = V(), H.pop(), y(g, "WhileStatement");
      case rc:
        return S && c(I, "'with' in strict mode"), B(), g.object = Da(), g.body = V(), y(g, "WithStatement");
      case za:
        return Fa();
      case Z:
        return B(), y(g, "EmptyStatement");
      default:
        l = T;
        w = O();
        if (f === sa && w.type === "Identifier" && E(Aa)) {
          for (n = 0; n < H.length; ++n) H[n].name === l && c(w.start, "Label '" + l + "' is already declared");
          H.push({
            name: l,
            kind: x.W ? "loop" : x === tb ? "switch" : null
          });
          g.body = V();
          H.pop();
          g.label = w;
          return y(g, "LabeledStatement");
        }
        g.la = w;
        na();
        return y(g, "ExpressionStatement");
    }
  }
  function Da() {
    G(Y);
    var f = O();
    G(W);
    return f;
  }
  function Fa(f) {
    var g = L(),
      l = true,
      n = false;
    g.body = [];
    for (G(za); !E(qa);) {
      var w = V();
      g.body.push(w);
      if (l && f && lb(w)) {
        var J = n;
        jb(n = true);
      }
      l = false;
    }
    n && !J && jb(false);
    return y(g, "BlockStatement");
  }
  function pb(f, g) {
    f.ua = g;
    G(Z);
    f.test = x === Z ? null : O();
    G(Z);
    f.update = x === W ? null : O();
    G(W);
    f.body = V();
    H.pop();
    return y(f, "ForStatement");
  }
  function ic(f, g) {
    f.left = g;
    f.right = O();
    G(W);
    f.body = V();
    H.pop();
    return y(f, "ForInStatement");
  }
  function hc(f, g) {
    f.fa = [];
    for (f.kind = "var";;) {
      var l = L();
      l.id = ba();
      S && Ya(l.id.name) && c(l.id.start, "Binding " + l.id.name + " in strict mode");
      l.ua = E(Xb) ? O(true, g) : null;
      f.fa.push(y(l, "VariableDeclarator"));
      if (!E(ha)) break;
    }
  }
  function O(f, g) {
    var l = vb(g);
    if (!f && x === ha) {
      f = ja(l);
      for (f.xb = [l]; E(ha);) f.xb.push(vb(g));
      return y(f, "SequenceExpression");
    }
    return l;
  }
  function vb(f) {
    var g = wb(xb(), -1, f);
    if (E(Sb)) {
      var l = ja(g);
      l.test = g;
      l.da = O(true);
      G(Aa);
      l.alternate = O(true, f);
      g = y(l, "ConditionalExpression");
    }
    return x.Cb ? (l = ja(g), l.operator = T, l.left = g, B(), l.right = vb(f), Xa(g), y(l, "AssignmentExpression")) : g;
  }
  function wb(f, g, l) {
    var n = x.L;
    if (n !== null && (!l || x !== Za) && n > g) {
      var w = ja(f);
      w.left = f;
      w.operator = T;
      f = x;
      B();
      w.right = wb(xb(), n, l);
      n = y(w, f === Vb || f === Wb ? "LogicalExpression" : "BinaryExpression");
      return wb(n, g, l);
    }
    return f;
  }
  function xb() {
    if (x.prefix) {
      var f = L(),
        g = x.$b;
      f.operator = T;
      ya = f.prefix = true;
      B();
      f.K = xb();
      g ? Xa(f.K) : S && f.operator === "delete" && f.K.type === "Identifier" && c(f.start, "Deleting local variable in strict mode");
      return y(f, g ? "UpdateExpression" : "UnaryExpression");
    }
    for (g = Ga($a()); x.cc && !Wa();) f = ja(g), f.operator = T, f.prefix = false, f.K = g, Xa(g), B(), g = y(f, "UpdateExpression");
    return g;
  }
  function Ga(f, g) {
    if (E(Rb)) {
      var l = ja(f);
      l.object = f;
      l.Wa = ba(true);
      l.bb = false;
      return Ga(y(l, "MemberExpression"), g);
    }
    return E(db) ? (l = ja(f), l.object = f, l.Wa = O(), l.bb = true, G(eb), Ga(y(l, "MemberExpression"), g)) : !g && E(Y) ? (l = ja(f), l.callee = f, l.arguments = yb(W, false), Ga(y(l, "CallExpression"), g)) : f;
  }
  function $a() {
    switch (x) {
      case sc:
        var f = L();
        B();
        return y(f, "ThisExpression");
      case sa:
        return ba();
      case Ca:
      case Ta:
      case ac:
        return f = L(), f.value = T, f.raw = r.slice(I, oa), B(), y(f, "Literal");
      case tc:
      case uc:
      case vc:
        return f = L(), f.value = x.$a, f.raw = x.l, B(), y(f, "Literal");
      case Y:
        f = fb;
        var g = I;
        B();
        var l = O();
        l.start = g;
        l.end = oa;
        z.C && (l.X.start = f, l.X.end = cb);
        z.Xa && (l.j = [g, oa]);
        G(W);
        return l;
      case db:
        return f = L(), B(), f.elements = yb(eb, true, true), y(f, "ArrayExpression");
      case za:
        f = L();
        g = true;
        l = false;
        f.h = [];
        for (B(); !E(qa);) {
          if (g) g = false;else if (G(ha), z.sb && E(qa)) break;
          var n = {
              key: x === Ca || x === Ta ? $a() : ba(true)
            },
            w = false;
          if (E(Aa)) {
            n.value = O(true);
            var J = n.kind = "init";
          } else n.key.type !== "Identifier" || n.key.name !== "get" && n.key.name !== "set" ? aa() : (w = l = true, J = n.kind = n.key.name, n.key = x === Ca || x === Ta ? $a() : ba(true), x !== Y && aa(), n.value = sb(L(), false));
          if (n.key.type === "Identifier" && (S || l)) for (var P = 0; P < f.h.length; ++P) {
            var ta = f.h[P];
            if (ta.key.name === n.key.name) {
              var zb = J === ta.kind || w && ta.kind === "init" || J === "init" && (ta.kind === "get" || ta.kind === "set");
              zb && !S && J === "init" && ta.kind === "init" && (zb = false);
              zb && c(n.key.start, "Redefinition of property");
            }
          }
          f.h.push(n);
        }
        return y(f, "ObjectExpression");
      case rb:
        return f = L(), B(), sb(f, false);
      case wc:
        return f = L(), B(), f.callee = Ga($a(), true), f.arguments = E(Y) ? yb(W, false) : Xc, y(f, "NewExpression");
    }
    aa();
  }
  function sb(f, g) {
    x === sa ? f.id = ba() : g ? aa() : f.id = null;
    f.oa = [];
    var l = true;
    for (G(Y); !E(W);) l ? l = false : G(ha), f.oa.push(ba());
    l = Ea;
    var n = H;
    Ea = true;
    H = [];
    f.body = Fa(true);
    Ea = l;
    H = n;
    if (S || f.body.body.length && lb(f.body.body[0])) {
      for (l = f.id ? -1 : 0; l < f.oa.length; ++l) if (n = 0 > l ? f.id : f.oa[l], (xc(n.name) || Ya(n.name)) && c(n.start, "Defining '" + n.name + "' in strict mode"), 0 <= l) for (var w = 0; w < l; ++w) n.name === f.oa[w].name && c(n.start, "Argument name clash in strict mode");
    }
    return y(f, g ? "FunctionDeclaration" : "FunctionExpression");
  }
  function yb(f, g, l) {
    for (var n = [], w = true; !E(f);) {
      if (w) w = false;else if (G(ha), g && z.sb && E(f)) break;
      n.push(l && x === ha ? null : O(true));
    }
    return n;
  }
  function ba(f) {
    var g = L();
    f && z.yb === "everywhere" && (f = false);
    x === sa ? (!f && (z.yb && Yc(T) || S && xc(T)) && r.slice(I, oa).indexOf("\\") === -1 && c(I, "The keyword '" + T + "' is reserved"), g.name = T) : f && x.l ? g.name = x.l : aa();
    ya = false;
    B();
    return y(g, "Identifier");
  }
  a.version = "0.5.0";
  var z,
    r = "",
    pa,
    kb;
  a.parse = function (f, g) {
    r = String(f);
    pa = r.length;
    z = g || {};
    for (var l in yc) Object.prototype.hasOwnProperty.call(z, l) || (z[l] = yc[l]);
    kb = z.sourceFile;
    la = 1;
    m = X = 0;
    ya = true;
    C();
    l = z.dc;
    hb = ia = m;
    z.C && (ib = new h());
    Ea = S = false;
    H = [];
    N();
    f = l || L();
    g = true;
    l || (f.body = []);
    for (; x !== gb;) l = V(), f.body.push(l), g && lb(l) && jb(true), g = false;
    return y(f, "Program");
  };
  var yc = {
      fc: false,
      sb: true,
      yb: false,
      Ib: false,
      C: false,
      va: null,
      Xa: false,
      dc: null,
      sourceFile: null,
      vb: null
    },
    m = 0,
    I = 0,
    oa = 0,
    fb,
    cb,
    x,
    T,
    ya,
    la,
    X,
    hb = 0,
    ia = 0,
    ib,
    Ea,
    H,
    S,
    Xc = [],
    Ca = {
      type: "num"
    },
    ac = {
      type: "regexp"
    },
    Ta = {
      type: "string"
    },
    sa = {
      type: "name"
    },
    gb = {
      type: "eof"
    },
    mb = {
      l: "break"
    },
    ub = {
      l: "case",
      m: true
    },
    pc = {
      l: "catch"
    },
    dc = {
      l: "continue"
    },
    ec = {
      l: "debugger"
    },
    mc = {
      l: "default"
    },
    fc = {
      l: "do",
      W: true
    },
    kc = {
      l: "else",
      m: true
    },
    qc = {
      l: "finally"
    },
    gc = {
      l: "for",
      W: true
    },
    rb = {
      l: "function"
    },
    jc = {
      l: "if"
    },
    lc = {
      l: "return",
      m: true
    },
    tb = {
      l: "switch"
    },
    nc = {
      l: "throw",
      m: true
    },
    oc = {
      l: "try"
    },
    qb = {
      l: "var"
    },
    ob = {
      l: "while",
      W: true
    },
    rc = {
      l: "with"
    },
    wc = {
      l: "new",
      m: true
    },
    sc = {
      l: "this"
    },
    tc = {
      l: "null",
      $a: null
    },
    uc = {
      l: "true",
      $a: true
    },
    vc = {
      l: "false",
      $a: false
    },
    Za = {
      l: "in",
      L: 7,
      m: true
    },
    Vc = {
      "break": mb,
      "case": ub,
      "catch": pc,
      "continue": dc,
      "debugger": ec,
      "default": mc,
      "do": fc,
      "else": kc,
      "finally": qc,
      "for": gc,
      "function": rb,
      "if": jc,
      "return": lc,
      "switch": tb,
      "throw": nc,
      "try": oc,
      "var": qb,
      "while": ob,
      "with": rc,
      "null": tc,
      "true": uc,
      "false": vc,
      "new": wc,
      "in": Za,
      "instanceof": {
        l: "instanceof",
        L: 7,
        m: true
      },
      "this": sc,
      "typeof": {
        l: "typeof",
        prefix: true,
        m: true
      },
      "void": {
        l: "void",
        prefix: true,
        m: true
      },
      "delete": {
        l: "delete",
        prefix: true,
        m: true
      }
    },
    db = {
      type: "[",
      m: true
    },
    eb = {
      type: "]"
    },
    za = {
      type: "{",
      m: true
    },
    qa = {
      type: "}"
    },
    Y = {
      type: "(",
      m: true
    },
    W = {
      type: ")"
    },
    ha = {
      type: ",",
      m: true
    },
    Z = {
      type: ";",
      m: true
    },
    Aa = {
      type: ":",
      m: true
    },
    Rb = {
      type: "."
    },
    Sb = {
      type: "?",
      m: true
    },
    Ub = {
      L: 10,
      m: true
    },
    Xb = {
      Cb: true,
      m: true
    },
    ma = {
      Cb: true,
      m: true
    },
    Pc = {
      cc: true,
      prefix: true,
      $b: true
    },
    Yb = {
      prefix: true,
      m: true
    },
    Vb = {
      L: 1,
      m: true
    },
    Wb = {
      L: 2,
      m: true
    },
    Mc = {
      L: 3,
      m: true
    },
    Oc = {
      L: 4,
      m: true
    },
    Nc = {
      L: 5,
      m: true
    },
    Tc = {
      L: 6,
      m: true
    },
    Sc = {
      L: 7,
      m: true
    },
    Rc = {
      L: 8,
      m: true
    },
    Qc = {
      L: 9,
      prefix: true,
      m: true
    },
    Lc = {
      L: 10,
      m: true
    },
    Yc = e("class enum extends super const export import"),
    xc = e("implements interface let package private protected public static yield"),
    Ya = e("eval arguments"),
    Uc = e("break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this"),
    Kc = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/,
    Pb = RegExp("[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]"),
    Jc = RegExp("[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u0620-\u0649\u0672-\u06D3\u06E7-\u06E8\u06FB-\u06FC\u0730-\u074A\u0800-\u0814\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0840-\u0857\u08E4-\u08FE\u0900-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0963\u0966-\u096F\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09D7\u09DF-\u09E0\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A66-\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5F-\u0B60\u0B66-\u0B6F\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE6-\u0BEF\u0C01-\u0C03\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62-\u0C63\u0C66-\u0C6F\u0C82\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2-\u0CE3\u0CE6-\u0CEF\u0D02\u0D03\u0D46-\u0D48\u0D57\u0D62-\u0D63\u0D66-\u0D6F\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E34-\u0E3A\u0E40-\u0E45\u0E50-\u0E59\u0EB4-\u0EB9\u0EC8-\u0ECD\u0ED0-\u0ED9\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F41-\u0F47\u0F71-\u0F84\u0F86-\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1029\u1040-\u1049\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109D\u135D-\u135F\u170E-\u1710\u1720-\u1730\u1740-\u1750\u1772\u1773\u1780-\u17B2\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1920-\u192B\u1930-\u193B\u1951-\u196D\u19B0-\u19C0\u19C8-\u19C9\u19D0-\u19D9\u1A00-\u1A15\u1A20-\u1A53\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1B46-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1BB0-\u1BB9\u1BE6-\u1BF3\u1C00-\u1C22\u1C40-\u1C49\u1C5B-\u1C7D\u1CD0-\u1CD2\u1D00-\u1DBE\u1E01-\u1F15\u200C\u200D\u203F\u2040\u2054\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2D81-\u2D96\u2DE0-\u2DFF\u3021-\u3028\u3099\u309A\uA640-\uA66D\uA674-\uA67D\uA69F\uA6F0-\uA6F1\uA7F8-\uA800\uA806\uA80B\uA823-\uA827\uA880-\uA881\uA8B4-\uA8C4\uA8D0-\uA8D9\uA8F3-\uA8F7\uA900-\uA909\uA926-\uA92D\uA930-\uA945\uA980-\uA983\uA9B3-\uA9C0\uAA00-\uAA27\uAA40-\uAA41\uAA4C-\uAA4D\uAA50-\uAA59\uAA7B\uAAE0-\uAAE9\uAAF2-\uAAF3\uABC0-\uABE1\uABEC\uABED\uABF0-\uABF9\uFB20-\uFB28\uFE00-\uFE0F\uFE20-\uFE26\uFE33\uFE34\uFE4D-\uFE4F\uFF10-\uFF19\uFF3F]"),
    Va = /[\n\r\u2028\u2029]/,
    Sa = /\r\n|[\n\r\u2028\u2029]/g,
    ra,
    nb = {
      kind: "loop"
    },
    Wc = {
      kind: "switch"
    };
};
var __this = __this = typeof globalThis === "undefined" ? void 0 : globalThis;
ca(__this.j || (__this.j = {}));
function t(a, b) {
  typeof a === "string" && (a = da(a, "code"));
  var d = a.constructor;
  this.ya = function () {
    return new d({
      options: {}
    });
  };
  var c = this.ya(),
    e;
  for (e in a) c[e] = e === "body" ? a[e].slice() : a[e];
  this.ra = c;
  this.ca = [];
  this.qb = b;
  this.za = false;
  this.ba = [];
  this.Ya = 0;
  this.rb = Object.create(null);
  a = /^step([A-Z]\w*)$/;
  var h, k;
  for (k in this) typeof this[k] === "function" && (h = k.match(a)) && (this.rb[h[1]] = this[k].bind(this));
  this.N = ea(this, this.ra, null);
  this.Na = this.N.object;
  this.ra = da(this.ba.join("\n"), "polyfills");
  this.ba = void 0;
  fa(this.ra);
  h = new u(this.ra, this.N);
  h.done = false;
  this.o = [h];
  this.Eb();
  this.value = void 0;
  this.ra = c;
  h = new u(this.ra, this.N);
  h.done = false;
  this.o.length = 0;
  this.o[0] = h;
}
var ka = {
    C: true,
    kc: 5
  },
  ua = {
    configurable: true,
    enumerable: true,
    writable: false
  },
  v = {
    configurable: true,
    enumerable: false,
    writable: true
  },
  A = {
    configurable: true,
    enumerable: false,
    writable: false
  },
  va = {
    configurable: false,
    enumerable: false,
    writable: false
  },
  wa = {
    configurable: false,
    enumerable: true,
    writable: true
  },
  xa = {
    STEP_ERROR: true
  },
  Ha = {
    SCOPE_REFERENCE: true
  },
  Ia = {
    VALUE_IN_DESCRIPTOR: true
  },
  Ja = {
    REGEXP_TIMEOUT: true
  },
  Ka = [],
  La = null,
  Ma = null,
  Na = typeof globalThis === "undefined" ? void 0 : globalThis,
  Oa = ["onmessage = function(e) {", "var result;", "var data = e.data;", "switch (data[0]) {", "case 'split':", "result = data[1].split(data[2], data[3]);", "break;", "case 'match':", "result = data[1].match(data[2]);", "break;", "case 'search':", "result = data[1].search(data[2]);", "break;", "case 'replace':", "result = data[1].replace(data[2], data[3]);", "break;", "case 'exec':", "var regexp = data[1];", "regexp.lastIndex = data[2];", "result = [regexp.exec(data[3]), data[1].lastIndex];", "break;", "default:", "throw Error('Unknown RegExp operation: ' + data[0]);", "}", "postMessage(result);", "close();", "};"];
function Pa(a) {
  var b = a >>> 0;
  return b === Number(a) ? b : NaN;
}
function Qa(a) {
  var b = a >>> 0;
  return String(b) === String(a) && b !== 4294967295 ? b : NaN;
}
function fa(a, b, d) {
  b ? a.start = b : delete a.start;
  d ? a.end = d : delete a.end;
  for (var c in a) if (c !== "loc" && a.hasOwnProperty(c)) {
    var e = a[c];
    e && typeof e === "object" && fa(e, b, d);
  }
}
t.prototype.REGEXP_MODE = 2;
t.prototype.REGEXP_THREAD_TIMEOUT = 1e3;
t.prototype.POLYFILL_TIMEOUT = 1e3;
p = t.prototype;
p.P = false;
p.Ka = false;
p.Kb = 0;
p.ic = 0;
function da(a, b) {
  var d = {},
    c;
  for (c in ka) d[c] = ka[c];
  d.sourceFile = b;
  return Na.j.parse(a, d);
}
p.Jb = function (a) {
  var b = this.o[0];
  if (!b || b.node.type !== "Program") throw Error("Expecting original AST to start with a Program node");
  typeof a === "string" && (a = da(a, "appendCode" + this.Kb++));
  if (!a || a.type !== "Program") throw Error("Expecting new AST to start with a Program node");
  Ra(this, a, b.scope);
  Array.prototype.push.apply(b.node.body, a.body);
  b.node.body.jb = null;
  b.done = false;
};
p.lb = function () {
  var a = this.o,
    b;
  do {
    var d = a[a.length - 1];
    if (this.za) break;else if (!d || d.node.type === "Program" && d.done) {
      if (!this.ca.length) return false;
      d = this.ca[0];
      if (!d || d.time > Date.now()) d = null;else {
        this.ca.shift();
        0 <= d.interval && ab(this, d, d.interval);
        var c = new u(d.node, d.scope);
        d.zb && (c.ia = 2, c.B = this.Na, c.U = d.zb, c.Qa = true, c.F = d.Lb);
        d = c;
      }
      if (!d) break;
    }
    c = d.node;
    var e = Ma;
    Ma = this;
    try {
      var h = this.rb[c.type](a, d, c);
    } catch (k) {
      if (k !== xa) throw this.value !== k && (this.value = void 0), k;
    } finally {
      Ma = e;
    }
    h && a.push(h);
    if (this.P) throw this.value = void 0, Error("Getter not supported in this context");
    if (this.Ka) throw this.value = void 0, Error("Setter not supported in this context");
    b || c.end || (b = Date.now() + this.POLYFILL_TIMEOUT);
  } while (!c.end && b > Date.now());
  return true;
};
p.Eb = function () {
  for (; !this.za && this.lb(););
  return this.za;
};
function bb(a, b) {
  a.g(b, "NaN", NaN, va);
  a.g(b, "Infinity", Infinity, va);
  a.g(b, "undefined", void 0, va);
  a.g(b, "window", b, ua);
  a.g(b, "this", b, va);
  a.g(b, "self", b);
  a.M = new D(null);
  a.Z = new D(a.M);
  Ab(a, b);
  Bb(a, b);
  b.xa = a.M;
  a.g(b, "constructor", a.v, v);
  Cb(a, b);
  Db(a, b);
  Eb(a, b);
  Fb(a, b);
  Gb(a, b);
  Hb(a, b);
  Ib(a, b);
  Jb(a, b);
  Kb(a, b);
  var d = a.i(function () {
    throw EvalError("Can't happen");
  }, false);
  d.eval = true;
  a.g(b, "eval", d, v);
  a.g(b, "parseInt", a.i(parseInt, false), v);
  a.g(b, "parseFloat", a.i(parseFloat, false), v);
  a.g(b, "isNaN", a.i(isNaN, false), v);
  a.g(b, "isFinite", a.i(isFinite, false), v);
  for (var c = [[escape, "escape"], [unescape, "unescape"], [decodeURI, "decodeURI"], [decodeURIComponent, "decodeURIComponent"], [encodeURI, "encodeURI"], [encodeURIComponent, "encodeURIComponent"]], e = 0; e < c.length; e++) d = function (h) {
    return function (k) {
      try {
        return h(k);
      } catch (q) {
        K(a, a.Gb, q.message);
      }
    };
  }(c[e][0]), a.g(b, c[e][1], a.i(d, false), v);
  d = function (h) {
    return Lb(a, false, arguments);
  };
  a.g(b, "setTimeout", a.i(d, false), v);
  d = function (h) {
    return Lb(a, true, arguments);
  };
  a.g(b, "setInterval", a.i(d, false), v);
  d = function (h) {
    Mb(a, h);
  };
  a.g(b, "clearTimeout", a.i(d, false), v);
  d = function (h) {
    Mb(a, h);
  };
  a.g(b, "clearInterval", a.i(d, false), v);
  a.OBJECT = a.v;
  a.OBJECT_PROTO = a.M;
  a.FUNCTION = a.O;
  a.FUNCTION_PROTO = a.Z;
  a.ARRAY = a.qa;
  a.ARRAY_PROTO = a.La;
  a.REGEXP = a.I;
  a.REGEXP_PROTO = a.Ma;
  a.DATE = a.$;
  a.DATE_PROTO = a.nb;
  a.qb && a.qb(a, b);
}
p.Wb = 0;
function Ab(a, b) {
  var d = /^[A-Za-z_$][\w$]*$/;
  var c = function (e) {
    var h = arguments.length ? String(arguments[arguments.length - 1]) : "",
      k = Array.prototype.slice.call(arguments, 0, -1).join(",").trim();
    if (k) {
      k = k.split(/\s*,\s*/);
      for (var q = 0; q < k.length; q++) {
        var C = k[q];
        d.test(C) || K(a, a.T, "Invalid function argument: " + C);
      }
      k = k.join(", ");
    }
    try {
      var U = da("(function(" + k + ") {" + h + "})", "function" + a.Wb++);
    } catch (N) {
      K(a, a.T, "Invalid code: " + N.message);
    }
    U.body.length !== 1 && K(a, a.T, "Invalid code in function body");
    return Nb(a, U.body[0].la, a.N, "anonymous");
  };
  a.O = a.i(c, true);
  a.g(b, "Function", a.O, v);
  a.g(a.O, "prototype", a.Z, v);
  a.g(a.Z, "constructor", a.O, v);
  a.Z.Ta = function () {};
  a.Z.Ta.id = a.Ya++;
  a.Z.Ab = true;
  a.g(a.Z, "length", 0, A);
  a.Z.H = "Function";
  c = function (e, h) {
    var k = a.o[a.o.length - 1];
    k.U = this;
    k.B = e;
    k.F = [];
    h !== null && h !== void 0 && (h instanceof D ? k.F = Ob(a, h) : K(a, a.j, "CreateListFromArrayLike called on non-object"));
    k.eb = false;
  };
  M(a, a.O, "apply", c);
  c = function (e) {
    var h = a.o[a.o.length - 1];
    h.U = this;
    h.B = e;
    h.F = [];
    for (var k = 1; k < arguments.length; k++) h.F.push(arguments[k]);
    h.eb = false;
  };
  M(a, a.O, "call", c);
  a.ba.push("Object.defineProperty(Function.prototype, 'bind',", "{configurable: true, writable: true, value:", "function bind(oThis) {", "if (typeof this !== 'function') {", "throw TypeError('What is trying to be bound is not callable');", "}", "var aArgs   = Array.prototype.slice.call(arguments, 1),", "fToBind = this,", "fNOP    = function() {},", "fBound  = function() {", "return fToBind.apply(this instanceof fNOP", "? this", ": oThis,", "aArgs.concat(Array.prototype.slice.call(arguments)));", "};", "if (this.prototype) {", "fNOP.prototype = this.prototype;", "}", "fBound.prototype = new fNOP();", "return fBound;", "}", "});", "");
  c = function () {
    return String(this);
  };
  M(a, a.O, "toString", c);
  a.g(a.O, "toString", a.i(c, false), v);
  c = function () {
    return this.valueOf();
  };
  M(a, a.O, "valueOf", c);
  a.g(a.O, "valueOf", a.i(c, false), v);
}
function Bb(a, b) {
  function d(e) {
    e !== void 0 && e !== null || K(a, a.j, "Cannot convert '" + e + "' to object");
  }
  var c = function (e) {
    if (e === void 0 || e === null) return zc(a) ? this : a.s(a.M);
    if (!(e instanceof D)) {
      var h = a.s(Ac(a, e));
      h.data = e;
      return h;
    }
    return e;
  };
  a.v = a.i(c, true);
  a.g(a.v, "prototype", a.M, v);
  a.g(a.M, "constructor", a.v, v);
  a.g(b, "Object", a.v, v);
  c = function (e) {
    d(e);
    return Bc(a, Object.getOwnPropertyNames(e instanceof D ? e.h : e));
  };
  a.g(a.v, "getOwnPropertyNames", a.i(c, false), v);
  c = function (e) {
    d(e);
    e instanceof D && (e = e.h);
    return Bc(a, Object.keys(e));
  };
  a.g(a.v, "keys", a.i(c, false), v);
  c = function (e) {
    if (e === null) return a.s(null);
    e instanceof D || K(a, a.j, "Object prototype may only be an Object or null, not " + e);
    return a.s(e);
  };
  a.g(a.v, "create", a.i(c, false), v);
  a.ba.push("(function() {", "var create_ = Object.create;", "Object.create = function create(proto, props) {", "var obj = create_(proto);", "props && Object.defineProperties(obj, props);", "return obj;", "};", "})();", "");
  c = function (e, h, k) {
    h = String(h);
    e instanceof D || K(a, a.j, "Object.defineProperty called on non-object: " + e);
    k instanceof D || K(a, a.j, "Property description must be an object");
    !e.preventExtensions || h in e.h || K(a, a.j, "Can't define property '" + h + "', object is not extensible");
    a.g(e, h, Ia, k.h);
    return e;
  };
  a.g(a.v, "defineProperty", a.i(c, false), v);
  a.ba.push("(function() {", "var defineProperty_ = Object.defineProperty;", "Object.defineProperty = function defineProperty(obj, prop, d1) {", "var d2 = {};", "if ('configurable' in d1) d2.configurable = d1.configurable;", "if ('enumerable' in d1) d2.enumerable = d1.enumerable;", "if ('writable' in d1) d2.writable = d1.writable;", "if ('value' in d1) d2.value = d1.value;", "if ('get' in d1) d2.get = d1.get;", "if ('set' in d1) d2.set = d1.set;", "return defineProperty_(obj, prop, d2);", "};", "})();", "Object.defineProperty(Object, 'defineProperties',", "{configurable: true, writable: true, value:", "function defineProperties(obj, props) {", "var keys = Object.keys(props);", "for (var i = 0; i < keys.length; i++) {", "Object.defineProperty(obj, keys[i], props[keys[i]]);", "}", "return obj;", "}", "});", "");
  c = function (e, h) {
    e instanceof D || K(a, a.j, "Object.getOwnPropertyDescriptor called on non-object: " + e);
    h = String(h);
    if (h in e.h) {
      var k = Object.getOwnPropertyDescriptor(e.h, h),
        q = e.V[h];
      e = e.Y[h];
      h = a.s(a.M);
      q || e ? (a.g(h, "get", q), a.g(h, "set", e)) : (a.g(h, "value", k.value), a.g(h, "writable", k.writable));
      a.g(h, "configurable", k.configurable);
      a.g(h, "enumerable", k.enumerable);
      return h;
    }
  };
  a.g(a.v, "getOwnPropertyDescriptor", a.i(c, false), v);
  c = function (e) {
    d(e);
    return Ac(a, e);
  };
  a.g(a.v, "getPrototypeOf", a.i(c, false), v);
  c = function (e) {
    return !!e && !e.preventExtensions;
  };
  a.g(a.v, "isExtensible", a.i(c, false), v);
  c = function (e) {
    e instanceof D && (e.preventExtensions = true);
    return e;
  };
  a.g(a.v, "preventExtensions", a.i(c, false), v);
  M(a, a.v, "toString", D.prototype.toString);
  M(a, a.v, "toLocaleString", D.prototype.toString);
  M(a, a.v, "valueOf", D.prototype.valueOf);
  c = function (e) {
    d(this);
    return this instanceof D ? String(e) in this.h : this.hasOwnProperty(e);
  };
  M(a, a.v, "hasOwnProperty", c);
  c = function (e) {
    d(this);
    return this instanceof D ? Object.prototype.propertyIsEnumerable.call(this.h, e) : this.propertyIsEnumerable(e);
  };
  M(a, a.v, "propertyIsEnumerable", c);
  c = function (e) {
    for (;;) {
      e = Ac(a, e);
      if (!e) return false;
      if (e === this) return true;
    }
  };
  M(a, a.v, "isPrototypeOf", c);
}
function Cb(a, b) {
  var d = function (c) {
    var e = zc(a) ? this : Cc(a),
      h = arguments[0];
    if (arguments.length === 1 && typeof h === "number") isNaN(Pa(h)) && K(a, a.ob, "Invalid array length: " + h), e.h.length = h;else {
      for (h = 0; h < arguments.length; h++) e.h[h] = arguments[h];
      e.h.length = h;
    }
    return e;
  };
  a.qa = a.i(d, true);
  a.La = a.qa.h.prototype;
  a.g(b, "Array", a.qa, v);
  d = function (c) {
    return c && c.H === "Array";
  };
  a.g(a.qa, "isArray", a.i(d, false), v);
  a.g(a.La, "length", 0, {
    configurable: false,
    enumerable: false,
    writable: true
  });
  a.La.H = "Array";
  a.ba.push("(function() {", "function createArrayMethod_(f) {", "Object.defineProperty(Array.prototype, f.name,", "{configurable: true, writable: true, value: f});", "}", "createArrayMethod_(", "function pop() {", "if (!this) throw TypeError();", "var o = Object(this), len = o.length >>> 0;", "if (!len || len < 0) {", "o.length = 0;", "return undefined;", "}", "len--;", "var x = o[len];", "delete o[len];", "o.length = len;", "return x;", "}", ");", "createArrayMethod_(", "function push(var_args) {", "if (!this) throw TypeError();", "var o = Object(this), len = o.length >>> 0;", "for (var i = 0; i < arguments.length; i++) {", "o[len] = arguments[i];", "len++;", "}", "o.length = len;", "return len;", "}", ");", "createArrayMethod_(", "function shift() {", "if (!this) throw TypeError();", "var o = Object(this), len = o.length >>> 0;", "if (!len || len < 0) {", "o.length = 0;", "return undefined;", "}", "var value = o[0];", "for (var i = 0; i < len - 1; i++) {", "if ((i + 1) in o) {", "o[i] = o[i + 1];", "} else {", "delete o[i];", "}", "}", "delete o[i];", "o.length = len - 1;", "return value;", "}", ");", "createArrayMethod_(", "function unshift(var_args) {", "if (!this) throw TypeError();", "var o = Object(this), len = o.length >>> 0;", "if (!len || len < 0) {", "len = 0;", "}", "for (var i = len - 1; i >= 0; i--) {", "if (i in o) {", "o[i + arguments.length] = o[i];", "} else {", "delete o[i + arguments.length];", "}", "}", "for (var i = 0; i < arguments.length; i++) {", "o[i] = arguments[i];", "}", "return (o.length = len + arguments.length);", "}", ");", "createArrayMethod_(", "function reverse() {", "if (!this) throw TypeError();", "var o = Object(this), len = o.length >>> 0;", "if (!len || len < 2) {", "return o;", "}", "for (var i = 0; i < len / 2 - 0.5; i++) {", "var x = o[i];", "var hasX = i in o;", "if ((len - i - 1) in o) {", "o[i] = o[len - i - 1];", "} else {", "delete o[i];", "}", "if (hasX) {", "o[len - i - 1] = x;", "} else {", "delete o[len - i - 1];", "}", "}", "return o;", "}", ");", "createArrayMethod_(", "function indexOf(searchElement, fromIndex) {", "if (!this) throw TypeError();", "var o = Object(this), len = o.length >>> 0;", "var n = fromIndex | 0;", "if (!len || n >= len) {", "return -1;", "}", "var i = Math.max(n >= 0 ? n : len - Math.abs(n), 0);", "while (i < len) {", "if (i in o && o[i] === searchElement) {", "return i;", "}", "i++;", "}", "return -1;", "}", ");", "createArrayMethod_(", "function lastIndexOf(searchElement, fromIndex) {", "if (!this) throw TypeError();", "var o = Object(this), len = o.length >>> 0;", "if (!len) {", "return -1;", "}", "var n = len - 1;", "if (arguments.length > 1) {", "n = fromIndex | 0;", "if (n) {", "n = (n > 0 || -1) * Math.floor(Math.abs(n));", "}", "}", "var i = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n);", "while (i >= 0) {", "if (i in o && o[i] === searchElement) {", "return i;", "}", "i--;", "}", "return -1;", "}", ");", "createArrayMethod_(", "function slice(start, end) {", "if (!this) throw TypeError();", "var o = Object(this), len = o.length >>> 0;", "start |= 0;", "start = (start >= 0) ? start : Math.max(0, len + start);", "if (typeof end !== 'undefined') {", "if (end !== Infinity) {", "end |= 0;", "}", "if (end < 0) {", "end = len + end;", "} else {", "end = Math.min(end, len);", "}", "} else {", "end = len;", "}", "var size = end - start;", "var cloned = new Array(size);", "for (var i = 0; i < size; i++) {", "if ((start + i) in o) {", "cloned[i] = o[start + i];", "}", "}", "return cloned;", "}", ");", "createArrayMethod_(", "function splice(start, deleteCount, var_args) {", "if (!this) throw TypeError();", "var o = Object(this), len = o.length >>> 0;", "start |= 0;", "if (start < 0) {", "start = Math.max(len + start, 0);", "} else {", "start = Math.min(start, len);", "}", "if (arguments.length < 1) {", "deleteCount = len - start;", "} else {", "deleteCount |= 0;", "deleteCount = Math.max(0, Math.min(deleteCount, len - start));", "}", "var removed = [];", "for (var i = start; i < start + deleteCount; i++) {", "if (i in o) {", "removed.push(o[i]);", "} else {", "removed.length++;", "}", "if ((i + deleteCount) in o) {", "o[i] = o[i + deleteCount];", "} else {", "delete o[i];", "}", "}", "for (var i = start + deleteCount; i < len - deleteCount; i++) {", "if ((i + deleteCount) in o) {", "o[i] = o[i + deleteCount];", "} else {", "delete o[i];", "}", "}", "for (var i = len - deleteCount; i < len; i++) {", "delete o[i];", "}", "len -= deleteCount;", "var arl = arguments.length - 2;", "for (var i = len - 1; i >= start; i--) {", "if (i in o) {", "o[i + arl] = o[i];", "} else {", "delete o[i + arl];", "}", "}", "len += arl;", "for (var i = 2; i < arguments.length; i++) {", "o[start + i - 2] = arguments[i];", "}", "o.length = len;", "return removed;", "}", ");", "createArrayMethod_(", "function concat(var_args) {", "if (!this) throw TypeError();", "var o = Object(this);", "var cloned = [];", "for (var i = -1; i < arguments.length; i++) {", "var value = (i === -1) ? o : arguments[i];", "if (Array.isArray(value)) {", "for (var j = 0, l = value.length; j < l; j++) {", "if (j in value) {", "cloned.push(value[j]);", "} else {", "cloned.length++;", "}", "}", "} else {", "cloned.push(value);", "}", "}", "return cloned;", "}", ");", "createArrayMethod_(", "function join(opt_separator) {", "if (!this) throw TypeError();", "var o = Object(this), len = o.length >>> 0;", "var sep = typeof opt_separator === 'undefined' ?", "',' : ('' + opt_separator);", "var str = '';", "for (var i = 0; i < len; i++) {", "if (i && sep) str += sep;", "str += (o[i] === null || o[i] === undefined) ? '' : o[i];", "}", "return str;", "}", ");", "createArrayMethod_(", "function every(callbackfn, thisArg) {", "if (!this || typeof callbackfn !== 'function') throw TypeError();", "var t, k = 0;", "var o = Object(this), len = o.length >>> 0;", "if (arguments.length > 1) t = thisArg;", "while (k < len) {", "if (k in o && !callbackfn.call(t, o[k], k, o)) return false;", "k++;", "}", "return true;", "}", ");", "createArrayMethod_(", "function filter(fun, var_args) {", "if (this === void 0 || this === null || typeof fun !== 'function') throw TypeError();", "var o = Object(this), len = o.length >>> 0;", "var res = [];", "var thisArg = arguments.length >= 2 ? arguments[1] : void 0;", "for (var i = 0; i < len; i++) {", "if (i in o) {", "var val = o[i];", "if (fun.call(thisArg, val, i, o)) res.push(val);", "}", "}", "return res;", "}", ");", "createArrayMethod_(", "function forEach(callback, thisArg) {", "if (!this || typeof callback !== 'function') throw TypeError();", "var t, k = 0;", "var o = Object(this), len = o.length >>> 0;", "if (arguments.length > 1) t = thisArg;", "while (k < len) {", "if (k in o) callback.call(t, o[k], k, o);", "k++;", "}", "}", ");", "createArrayMethod_(", "function map(callback, thisArg) {", "if (!this || typeof callback !== 'function') throw TypeError();", "var t, k = 0;", "var o = Object(this), len = o.length >>> 0;", "if (arguments.length > 1) t = thisArg;", "var a = new Array(len);", "while (k < len) {", "if (k in o) a[k] = callback.call(t, o[k], k, o);", "k++;", "}", "return a;", "}", ");", "createArrayMethod_(", "function reduce(callback /*, initialValue*/) {", "if (!this || typeof callback !== 'function') throw TypeError();", "var o = Object(this), len = o.length >>> 0;", "var k = 0, value;", "if (arguments.length === 2) {", "value = arguments[1];", "} else {", "while (k < len && !(k in o)) k++;", "if (k >= len) {", "throw TypeError('Reduce of empty array with no initial value');", "}", "value = o[k++];", "}", "for (; k < len; k++) {", "if (k in o) value = callback(value, o[k], k, o);", "}", "return value;", "}", ");", "createArrayMethod_(", "function reduceRight(callback /*, initialValue*/) {", "if (null === this || 'undefined' === typeof this || 'function' !== typeof callback) throw TypeError();", "var o = Object(this), len = o.length >>> 0;", "var k = len - 1, value;", "if (arguments.length >= 2) {", "value = arguments[1];", "} else {", "while (k >= 0 && !(k in o)) k--;", "if (k < 0) {", "throw TypeError('Reduce of empty array with no initial value');", "}", "value = o[k--];", "}", "for (; k >= 0; k--) {", "if (k in o) value = callback(value, o[k], k, o);", "}", "return value;", "}", ");", "createArrayMethod_(", "function some(fun/*, thisArg*/) {", "if (!this || typeof fun !== 'function') throw TypeError();", "var o = Object(this), len = o.length >>> 0;", "var thisArg = arguments.length >= 2 ? arguments[1] : void 0;", "for (var i = 0; i < len; i++) {", "if (i in o && fun.call(thisArg, o[i], i, o)) return true;", "}", "return false;", "}", ");", "createArrayMethod_(", "function sort(opt_comp) {", "if (!this) throw TypeError();", "if (typeof opt_comp !== 'function') {", "opt_comp = undefined;", "}", "for (var i = 0; i < this.length; i++) {", "var changes = 0;", "for (var j = 0; j < this.length - i - 1; j++) {", "if (opt_comp ? (opt_comp(this[j], this[j + 1]) > 0) :", "(String(this[j]) > String(this[j + 1]))) {", "var swap = this[j];", "var hasSwap = j in this;", "if ((j + 1) in this) {", "this[j] = this[j + 1];", "} else {", "delete this[j];", "}", "if (hasSwap) {", "this[j + 1] = swap;", "} else {", "delete this[j + 1];", "}", "changes++;", "}", "}", "if (!changes) break;", "}", "return this;", "}", ");", "createArrayMethod_(", "function toLocaleString() {", "if (!this) throw TypeError();", "var o = Object(this), len = o.length >>> 0;", "var out = [];", "for (var i = 0; i < len; i++) {", "out[i] = (o[i] === null || o[i] === undefined) ? '' : o[i].toLocaleString();", "}", "return out.join(',');", "}", ");", "})();", "");
}
function Db(a, b) {
  var d = function (c) {
    c = arguments.length ? Na.String(c) : "";
    return zc(a) ? (this.data = c, this) : c;
  };
  a.J = a.i(d, true);
  a.g(b, "String", a.J, v);
  a.g(a.J, "fromCharCode", a.i(String.fromCharCode, false), v);
  b = "charAt charCodeAt concat indexOf lastIndexOf slice substr substring toLocaleLowerCase toLocaleUpperCase toLowerCase toUpperCase trim".split(" ");
  for (d = 0; d < b.length; d++) M(a, a.J, b[d], String.prototype[b[d]]);
  d = function (c, e, h) {
    e = a.R(e);
    h = a.R(h);
    try {
      return String(this).localeCompare(c, e, h);
    } catch (k) {
      K(a, a.D, "localeCompare: " + k.message);
    }
  };
  M(a, a.J, "localeCompare", d);
  d = function (c, e, h) {
    var k = String(this);
    e = e ? Number(e) : void 0;
    if (Q(a, c, a.I) && (c = c.data, Dc(a, c, h), a.REGEXP_MODE === 2)) {
      if (La) c = Ec(a, "string.split(separator, limit)", {
        string: k,
        separator: c,
        limit: e
      }, c, h), c !== Ja && h(Bc(a, c));else {
        var q = a.ha(),
          C = Fc(a, c, q, h);
        q.onmessage = function (U) {
          clearTimeout(C);
          h(Bc(a, U.data));
        };
        q.postMessage(["split", k, c, e]);
      }
      return;
    }
    c = k.split(c, e);
    h(Bc(a, c));
  };
  Gc(a, a.J, "split", d);
  d = function (c, e) {
    var h = String(this);
    c = Q(a, c, a.I) ? c.data : new RegExp(c);
    Dc(a, c, e);
    if (a.REGEXP_MODE === 2) {
      if (La) c = Ec(a, "string.match(regexp)", {
        string: h,
        regexp: c
      }, c, e), c !== Ja && e(c && Bc(a, c));else {
        var k = a.ha(),
          q = Fc(a, c, k, e);
        k.onmessage = function (C) {
          clearTimeout(q);
          e(C.data && Bc(a, C.data));
        };
        k.postMessage(["match", h, c]);
      }
    } else c = h.match(c), e(c && Bc(a, c));
  };
  Gc(a, a.J, "match", d);
  d = function (c, e) {
    var h = String(this);
    Q(a, c, a.I) ? c = c.data : c = new RegExp(c);
    Dc(a, c, e);
    if (a.REGEXP_MODE === 2) {
      if (La) c = Ec(a, "string.search(regexp)", {
        string: h,
        regexp: c
      }, c, e), c !== Ja && e(c);else {
        var k = a.ha(),
          q = Fc(a, c, k, e);
        k.onmessage = function (C) {
          clearTimeout(q);
          e(C.data);
        };
        k.postMessage(["search", h, c]);
      }
    } else e(h.search(c));
  };
  Gc(a, a.J, "search", d);
  d = function (c, e, h) {
    var k = String(this);
    e = String(e);
    if (Q(a, c, a.I) && (c = c.data, Dc(a, c, h), a.REGEXP_MODE === 2)) {
      if (La) c = Ec(a, "string.replace(substr, newSubstr)", {
        string: k,
        substr: c,
        newSubstr: e
      }, c, h), c !== Ja && h(c);else {
        var q = a.ha(),
          C = Fc(a, c, q, h);
        q.onmessage = function (U) {
          clearTimeout(C);
          h(U.data);
        };
        q.postMessage(["replace", k, c, e]);
      }
      return;
    }
    h(k.replace(c, e));
  };
  Gc(a, a.J, "replace", d);
  a.ba.push("(function() {", "var replace_ = String.prototype.replace;", "String.prototype.replace = function replace(substr, newSubstr) {", "if (typeof newSubstr !== 'function') {", "return replace_.call(this, substr, newSubstr);", "}", "var str = this;", "if (substr instanceof RegExp) {", "var subs = [];", "var m = substr.exec(str);", "while (m) {", "m.push(m.index, str);", "var inject = newSubstr.apply(null, m);", "subs.push([m.index, m[0].length, inject]);", "m = substr.global ? substr.exec(str) : null;", "}", "for (var i = subs.length - 1; i >= 0; i--) {", "str = str.substring(0, subs[i][0]) + subs[i][2] + str.substring(subs[i][0] + subs[i][1]);", "}", "} else {", "var i = str.indexOf(substr);", "if (i !== -1) {", "var inject = newSubstr(str.substr(i, substr.length), i, str);", "str = str.substring(0, i) + inject + str.substring(i + substr.length);", "}", "}", "return str;", "};", "})();", "");
}
function Eb(a, b) {
  a.mb = a.i(function (d) {
    d = Na.Boolean(d);
    return zc(a) ? (this.data = d, this) : d;
  }, true);
  a.g(b, "Boolean", a.mb, v);
}
function Fb(a, b) {
  var d = function (c) {
    c = arguments.length ? Na.Number(c) : 0;
    return zc(a) ? (this.data = c, this) : c;
  };
  a.aa = a.i(d, true);
  a.g(b, "Number", a.aa, v);
  b = ["MAX_VALUE", "MIN_VALUE", "NaN", "NEGATIVE_INFINITY", "POSITIVE_INFINITY"];
  for (d = 0; d < b.length; d++) a.g(a.aa, b[d], Number[b[d]], va);
  d = function (c) {
    try {
      return Number(this).toExponential(c);
    } catch (e) {
      K(a, a.D, e.message);
    }
  };
  M(a, a.aa, "toExponential", d);
  d = function (c) {
    try {
      return Number(this).toFixed(c);
    } catch (e) {
      K(a, a.D, e.message);
    }
  };
  M(a, a.aa, "toFixed", d);
  d = function (c) {
    try {
      return Number(this).toPrecision(c);
    } catch (e) {
      K(a, a.D, e.message);
    }
  };
  M(a, a.aa, "toPrecision", d);
  d = function (c) {
    try {
      return Number(this).toString(c);
    } catch (e) {
      K(a, a.D, e.message);
    }
  };
  M(a, a.aa, "toString", d);
  d = function (c, e) {
    c = c ? a.R(c) : void 0;
    e = e ? a.R(e) : void 0;
    try {
      return Number(this).toLocaleString(c, e);
    } catch (h) {
      K(a, a.D, "toLocaleString: " + h.message);
    }
  };
  M(a, a.aa, "toLocaleString", d);
}
function Gb(a, b) {
  var d = function (e, h) {
    if (!zc(a)) return Na.Date();
    var k = [null].concat(Array.from(arguments));
    this.data = new (Function.prototype.bind.apply(Na.Date, k))();
    return this;
  };
  a.$ = a.i(d, true);
  a.nb = a.$.h.prototype;
  a.g(b, "Date", a.$, v);
  a.g(a.$, "now", a.i(Date.now, false), v);
  a.g(a.$, "parse", a.i(Date.parse, false), v);
  a.g(a.$, "UTC", a.i(Date.UTC, false), v);
  b = "getDate getDay getFullYear getHours getMilliseconds getMinutes getMonth getSeconds getTime getTimezoneOffset getUTCDate getUTCDay getUTCFullYear getUTCHours getUTCMilliseconds getUTCMinutes getUTCMonth getUTCSeconds getYear setDate setFullYear setHours setMilliseconds setMinutes setMonth setSeconds setTime setUTCDate setUTCFullYear setUTCHours setUTCMilliseconds setUTCMinutes setUTCMonth setUTCSeconds setYear toDateString toISOString toJSON toGMTString toLocaleDateString toLocaleString toLocaleTimeString toTimeString toUTCString".split(" ");
  for (var c = 0; c < b.length; c++) d = function (e) {
    return function (h) {
      var k = this.data;
      k instanceof Date || K(a, a.j, e + " not called on a Date");
      for (var q = [], C = 0; C < arguments.length; C++) q[C] = a.R(arguments[C]);
      return k[e].apply(k, q);
    };
  }(b[c]), M(a, a.$, b[c], d);
}
function Hb(a, b) {
  var d = function (c, e) {
    if (zc(a)) var h = this;else {
      if (e === void 0 && Q(a, c, a.I)) return c;
      h = a.s(a.Ma);
    }
    c = c === void 0 ? "" : String(c);
    e = e ? String(e) : "";
    /^[gmi]*$/.test(e) || K(a, a.T, "Invalid regexp flag: " + e);
    try {
      var k = new Na.RegExp(c, e);
    } catch (q) {
      K(a, a.T, q.message);
    }
    Hc(a, h, k);
    return h;
  };
  a.I = a.i(d, true);
  a.Ma = a.I.h.prototype;
  a.g(b, "RegExp", a.I, v);
  a.g(a.I.h.prototype, "global", void 0, A);
  a.g(a.I.h.prototype, "ignoreCase", void 0, A);
  a.g(a.I.h.prototype, "multiline", void 0, A);
  a.g(a.I.h.prototype, "source", "(?:)", A);
  a.ba.push("Object.defineProperty(RegExp.prototype, 'test',", "{configurable: true, writable: true, value:", "function test(str) {", "return !!this.exec(str);", "}", "});");
  d = function (c, e) {
    function h(N) {
      if (N) {
        var F = Bc(a, N);
        a.g(F, "index", N.index);
        a.g(F, "input", N.input);
        return F;
      }
      return null;
    }
    var k = this.data;
    c = String(c);
    k.lastIndex = Number(a.G(this, "lastIndex"));
    Dc(a, k, e);
    if (a.REGEXP_MODE === 2) {
      if (La) c = Ec(a, "regexp.exec(string)", {
        string: c,
        regexp: k
      }, k, e), c !== Ja && (a.g(this, "lastIndex", k.lastIndex), e(h(c)));else {
        var q = a.ha(),
          C = Fc(a, k, q, e),
          U = this;
        q.onmessage = function (N) {
          clearTimeout(C);
          a.g(U, "lastIndex", N.data[1]);
          e(h(N.data[0]));
        };
        q.postMessage(["exec", k, k.lastIndex, c]);
      }
    } else c = k.exec(c), a.g(this, "lastIndex", k.lastIndex), e(h(c));
  };
  Gc(a, a.I, "exec", d);
}
function Ib(a, b) {
  function d(c) {
    var e = a.i(function (h) {
      var k = zc(a) ? this : a.Aa(e);
      Ic(a, k, h);
      return k;
    }, true);
    a.g(e, "prototype", a.Aa(a.D), v);
    a.g(e.h.prototype, "name", c, v);
    a.g(b, c, e, v);
    return e;
  }
  a.D = a.i(function (c) {
    var e = zc(a) ? this : a.Aa(a.D);
    Ic(a, e, c);
    return e;
  }, true);
  a.g(b, "Error", a.D, v);
  a.g(a.D.h.prototype, "message", "", v);
  a.g(a.D.h.prototype, "name", "Error", v);
  d("EvalError");
  a.ob = d("RangeError");
  a.pb = d("ReferenceError");
  a.T = d("SyntaxError");
  a.j = d("TypeError");
  a.Gb = d("URIError");
}
function Jb(a, b) {
  var d = a.s(a.M);
  a.g(b, "Math", d, v);
  var c = "E LN2 LN10 LOG2E LOG10E PI SQRT1_2 SQRT2".split(" ");
  for (b = 0; b < c.length; b++) a.g(d, c[b], Math[c[b]], A);
  c = "abs acos asin atan atan2 ceil cos exp floor log max min pow random round sin sqrt tan".split(" ");
  for (b = 0; b < c.length; b++) a.g(d, c[b], a.i(Math[c[b]], false), v);
}
function Kb(a, b) {
  var d = a.s(a.M);
  a.g(b, "JSON", d, v);
  b = function (c) {
    try {
      var e = JSON.parse(String(c));
    } catch (h) {
      K(a, a.T, h.message);
    }
    return a.Ia(e);
  };
  a.g(d, "parse", a.i(b, false));
  b = function (c, e, h) {
    e && e.H === "Function" ? K(a, a.j, "Function replacer on JSON.stringify not supported") : e && e.H === "Array" ? (e = Ob(a, e), e = e.filter(function (q) {
      return typeof q === "string" || typeof q === "number";
    })) : e = null;
    typeof h !== "string" && typeof h !== "number" && (h = void 0);
    c = a.R(c);
    try {
      var k = JSON.stringify(c, e, h);
    } catch (q) {
      K(a, a.j, q.message);
    }
    return k;
  };
  a.g(d, "stringify", a.i(b, false));
}
function Q(a, b, d) {
  if (b === null || b === void 0 || !d) return false;
  d = d.h.prototype;
  if (b === d) return true;
  for (b = Ac(a, b); b;) {
    if (b === d) return true;
    b = b.xa;
  }
  return false;
}
function Hc(a, b, d) {
  b.data = new RegExp(d.source, d.flags);
  a.g(b, "lastIndex", d.lastIndex, v);
  a.g(b, "source", d.source, A);
  a.g(b, "global", d.global, A);
  a.g(b, "ignoreCase", d.ignoreCase, A);
  a.g(b, "multiline", d.multiline, A);
}
function Ic(a, b, d) {
  d && a.g(b, "message", String(d), v);
  d = [];
  for (var c = a.o.length - 1; 0 <= c; c--) {
    var e = a.o[c],
      h = e.node;
    h.type === "CallExpression" && (e = e.U) && d.length && (d[d.length - 1].Ob = a.G(e, "name"));
    !h.X || d.length && h.type !== "CallExpression" || d.push({
      Nb: h.X
    });
  }
  c = String(a.G(b, "name"));
  h = String(a.G(b, "message"));
  h = c + ": " + h + "\n";
  for (c = 0; c < d.length; c++) {
    var k = d[c].Nb;
    e = d[c].Ob;
    k = k.source + ":" + k.start.line + ":" + k.start.ab;
    h = e ? h + ("  at " + e + " (" + k + ")\n") : h + ("  at " + k + "\n");
  }
  a.g(b, "stack", h.trim(), v);
}
p.ha = function () {
  var a = this.ha.Mb;
  a || (a = new Blob([Oa.join("\n")], {
    type: "application/javascript"
  }), this.ha.Mb = a);
  return new Worker(URL.createObjectURL(a));
};
function Ec(a, b, d, c, e) {
  var h = {
    timeout: a.REGEXP_THREAD_TIMEOUT
  };
  try {
    return La.runInNewContext(b, d, h);
  } catch (k) {
    e(null), K(a, a.D, "RegExp Timeout: " + c);
  }
  return Ja;
}
function Dc(a, b, d) {
  if (a.REGEXP_MODE === 0) var c = false;else if (a.REGEXP_MODE === 1) c = true;else if (La) c = true;else if (typeof Worker === "function" && typeof URL === "function") c = true;else if (typeof require === "function") {
    try {
      La = require("vm");
    } catch (e) {}
    c = !!La;
  } else c = false;
  c || (d(null), K(a, a.D, "Regular expressions not supported: " + b));
}
function Fc(a, b, d, c) {
  return setTimeout(function () {
    d.terminate();
    c(null);
    try {
      K(a, a.D, "RegExp Timeout: " + b);
    } catch (e) {}
  }, a.REGEXP_THREAD_TIMEOUT);
}
p.Aa = function (a) {
  return this.s(a && a.h.prototype);
};
p.s = function (a) {
  if (typeof a !== "object") throw Error("Non object prototype");
  a = new D(a);
  Q(this, a, this.D) && (a.H = "Error");
  return a;
};
function Cc(a) {
  var b = a.s(a.La);
  a.g(b, "length", 0, {
    configurable: false,
    enumerable: false,
    writable: true
  });
  b.H = "Array";
  return b;
}
function Zc(a, b, d) {
  var c = a.s(a.Z);
  d ? (d = a.s(a.M), a.g(c, "prototype", d, v), a.g(d, "constructor", c, v)) : c.Ab = true;
  a.g(c, "length", b, A);
  c.H = "Function";
  return c;
}
function Nb(a, b, d, c) {
  var e = Zc(a, b.oa.length, true);
  e.Va = d;
  e.node = b;
  a.g(e, "name", b.id ? String(b.id.name) : c || "", A);
  return e;
}
p.i = function (a, b) {
  b = Zc(this, a.length, b);
  b.Ta = a;
  a.id = this.Ya++;
  this.g(b, "name", a.name, A);
  return b;
};
p.ub = function (a) {
  var b = Zc(this, a.length, true);
  b.Za = a;
  a.id = this.Ya++;
  this.g(b, "name", a.name, A);
  return b;
};
p.Ia = function (a) {
  if (a instanceof D) throw Error("Object is already pseudo");
  if (a === null || a === void 0 || a === true || a === false || typeof a === "string" || typeof a === "number") return a;
  if (a instanceof RegExp) {
    var b = this.s(this.Ma);
    Hc(this, b, a);
    return b;
  }
  if (a instanceof Date) return b = this.s(this.nb), b.data = new Date(a.valueOf()), b;
  if (typeof a === "function") {
    var d = this;
    b = Object.getOwnPropertyDescriptor(a, "prototype");
    return this.i(function () {
      var e = Array.prototype.slice.call(arguments).map(function (h) {
        return d.R(h);
      });
      e = a.apply(d, e);
      return d.Ia(e);
    }, !!b);
  }
  if (Array.isArray(a)) {
    b = Cc(this);
    for (var c = 0; c < a.length; c++) c in a && this.g(b, c, this.Ia(a[c]));
    return b;
  }
  b = this.s(this.M);
  for (c in a) this.g(b, c, this.Ia(a[c]));
  return b;
};
p.R = function (a, b) {
  if (typeof a !== "object" && typeof a !== "function" || a === null) return a;
  if (!(a instanceof D)) throw Error("Object is not pseudo");
  if (Q(this, a, this.I)) return b = new RegExp(a.data.source, a.data.flags), b.lastIndex = a.data.lastIndex, b;
  if (Q(this, a, this.$)) return new Date(a.data.valueOf());
  b = b || {
    hb: [],
    Sa: []
  };
  var d = b.hb.indexOf(a);
  if (d !== -1) return b.Sa[d];
  b.hb.push(a);
  if (Q(this, a, this.qa)) {
    d = [];
    b.Sa.push(d);
    for (var c = this.G(a, "length"), e = 0; e < c; e++) $c(this, a, e) && (d[e] = this.R(this.G(a, e), b));
  } else for (c in d = {}, b.Sa.push(d), a.h) e = this.R(a.h[c], b), Object.defineProperty(d, c, {
    value: e,
    writable: true,
    enumerable: true,
    configurable: true
  });
  b.hb.pop();
  b.Sa.pop();
  return d;
};
function Bc(a, b) {
  for (var d = Cc(a), c = Object.getOwnPropertyNames(b), e = 0; e < c.length; e++) a.g(d, c[e], b[c[e]]);
  return d;
}
function Ob(a, b) {
  var d = [],
    c;
  for (c in b.h) d[c] = a.G(b, c);
  d.length = Pa(a.G(b, "length")) || 0;
  return d;
}
function Ac(a, b) {
  switch (typeof b) {
    case "number":
      return a.aa.h.prototype;
    case "boolean":
      return a.mb.h.prototype;
    case "string":
      return a.J.h.prototype;
  }
  return b ? b.xa : null;
}
p.G = function (a, b) {
  if (this.P) throw Error("Getter not supported in that context");
  b = String(b);
  a !== void 0 && a !== null || K(this, this.j, "Cannot read property '" + b + "' of " + a);
  if (typeof a === "object" && !(a instanceof D)) throw TypeError("Expecting native value or pseudo object");
  if (b === "length") {
    if (Q(this, a, this.J)) return String(a).length;
  } else if (64 > b.charCodeAt(0) && Q(this, a, this.J)) {
    var d = Qa(b);
    if (!isNaN(d) && d < String(a).length) return String(a)[d];
  }
  do if (a.h && b in a.h) return (d = a.V[b]) ? (this.P = true, d) : a.h[b]; while (a = Ac(this, a));
};
function $c(a, b, d) {
  if (!(b instanceof D)) throw TypeError("Primitive data type has no properties");
  d = String(d);
  if (d === "length" && Q(a, b, a.J)) return true;
  if (Q(a, b, a.J)) {
    var c = Qa(d);
    if (!isNaN(c) && c < String(b).length) return true;
  }
  do if (b.h && d in b.h) return true; while (b = Ac(a, b));
  return false;
}
p.g = function (a, b, d, c) {
  if (this.Ka) throw Error("Setter not supported in that context");
  b = String(b);
  a !== void 0 && a !== null || K(this, this.j, "Cannot set property '" + b + "' of " + a);
  if (typeof a === "object" && !(a instanceof D)) throw TypeError("Expecting native value or pseudo object");
  c && ("get" in c || "set" in c) && ("value" in c || "writable" in c) && K(this, this.j, "Invalid property descriptor. Cannot both specify accessors and a value or writable attribute");
  var e = !this.o || ad(this).S;
  if (a instanceof D) {
    if (Q(this, a, this.J)) {
      var h = Qa(b);
      if (b === "length" || !isNaN(h) && h < String(a).length) {
        e && K(this, this.j, "Cannot assign to read only property '" + b + "' of String '" + a.data + "'");
        return;
      }
    }
    if (a.H === "Array") if (h = a.h.length, b === "length") {
      if (c) {
        if (!("value" in c)) return;
        d = c.value;
      }
      d = Pa(d);
      isNaN(d) && K(this, this.ob, "Invalid array length");
      if (d < h) for (k in a.h) {
        var k = Qa(k);
        !isNaN(k) && d <= k && delete a.h[k];
      }
    } else isNaN(k = Qa(b)) || (a.h.length = Math.max(h, k + 1));
    if (!a.preventExtensions || b in a.h) {
      if (c) {
        e = {};
        "get" in c && c.get && (a.V[b] = c.get, e.get = this.g.ac);
        "set" in c && c.set && (a.Y[b] = c.set, e.set = this.g.bc);
        "configurable" in c && (e.configurable = c.configurable);
        "enumerable" in c && (e.enumerable = c.enumerable);
        "writable" in c && (e.writable = c.writable, delete a.V[b], delete a.Y[b]);
        "value" in c ? (e.value = c.value, delete a.V[b], delete a.Y[b]) : d !== Ia && (e.value = d, delete a.V[b], delete a.Y[b]);
        try {
          Object.defineProperty(a.h, b, e);
        } catch (q) {
          K(this, this.j, "Cannot redefine property: " + b);
        }
        "get" in c && !c.get && delete a.V[b];
        "set" in c && !c.set && delete a.Y[b];
      } else {
        if (d === Ia) throw ReferenceError("Value not specified");
        for (c = a; !(b in c.h);) if (c = Ac(this, c), !c) {
          c = a;
          break;
        }
        if (c.Y && c.Y[b]) return this.Ka = true, c.Y[b];
        if (c.V && c.V[b]) e && K(this, this.j, "Cannot set property '" + b + "' of object '" + a + "' which only has a getter");else try {
          a.h[b] = d;
        } catch (q) {
          e && K(this, this.j, "Cannot assign to read only property '" + b + "' of object '" + a + "'");
        }
      }
    } else e && K(this, this.j, "Can't add property '" + b + "', object is not extensible");
  } else e && K(this, this.j, "Can't create property '" + b + "' on '" + a + "'");
};
p.g.ac = function () {
  throw Error("Placeholder getter");
};
p.g.bc = function () {
  throw Error("Placeholder setter");
};
function M(a, b, d, c) {
  a.g(b.h.prototype, d, a.i(c, false), v);
}
function Gc(a, b, d, c) {
  a.g(b.h.prototype, d, a.ub(c), v);
}
function ad(a) {
  a = a.o[a.o.length - 1].scope;
  if (!a) throw Error("No scope found");
  return a;
}
function ea(a, b, d) {
  var c = false;
  if (d && d.S) c = true;else {
    var e = b.body && b.body[0];
    e && e.la && e.la.type === "Literal" && e.la.value === "use strict" && (c = true);
  }
  e = a.s(null);
  c = new bd(d, c, e);
  d || bb(a, c.object);
  Ra(a, b, c);
  return c;
}
function cd(a, b, d) {
  if (!b) throw Error("parentScope required");
  a = d || a.s(null);
  return new bd(b, b.S, a);
}
function dd(a, b) {
  for (var d = ad(a); d && d !== a.N;) {
    if (b in d.object.h) return d.object.h[b];
    d = d.Va;
  }
  if (d === a.N && $c(a, d.object, b)) return a.G(d.object, b);
  d = a.o[a.o.length - 1].node;
  d.type === "UnaryExpression" && d.operator === "typeof" || K(a, a.pb, b + " is not defined");
}
function ed(a, b, d) {
  for (var c = ad(a), e = c.S; c && c !== a.N;) {
    if (b in c.object.h) {
      try {
        c.object.h[b] = d;
      } catch (h) {
        e && K(a, a.j, "Cannot assign to read only variable '" + b + "'");
      }
      return;
    }
    c = c.Va;
  }
  if (c === a.N && (!e || $c(a, c.object, b))) return a.g(c.object, b, d);
  K(a, a.pb, b + " is not defined");
}
function Ra(a, b, d) {
  if (b.jb) var c = b.jb;else {
    c = Object.create(null);
    switch (b.type) {
      case "VariableDeclaration":
        for (var e = 0; e < b.fa.length; e++) c[b.fa[e].id.name] = true;
        break;
      case "FunctionDeclaration":
        c[b.id.name] = b;
        break;
      case "BlockStatement":
      case "CatchClause":
      case "DoWhileStatement":
      case "ForInStatement":
      case "ForStatement":
      case "IfStatement":
      case "LabeledStatement":
      case "Program":
      case "SwitchCase":
      case "SwitchStatement":
      case "TryStatement":
      case "WithStatement":
      case "WhileStatement":
        var h = b.constructor,
          k;
        for (k in b) if (k !== "loc") {
          var q = b[k];
          if (q && typeof q === "object") {
            if (Array.isArray(q)) for (e = 0; e < q.length; e++) {
              if (q[e] && q[e].constructor === h) {
                var C = Ra(a, q[e], d);
                for (k in C) c[k] = C[k];
              }
            } else if (q.constructor === h) for (k in C = Ra(a, q, d), C) c[k] = C[k];
          }
        }
    }
    b.jb = c;
  }
  for (k in c) c[k] === true ? a.g(d.object, k, void 0, wa) : a.g(d.object, k, Nb(a, c[k], d), wa);
  return c;
}
function zc(a) {
  return a.o[a.o.length - 1].isConstructor;
}
function fd(a, b) {
  return b[0] === Ha ? dd(a, b[1]) : a.G(b[0], b[1]);
}
function gd(a, b, d) {
  return b[0] === Ha ? ed(a, b[1], d) : a.g(b[0], b[1], d);
}
function K(a, b, d) {
  if (!a.N) throw d === void 0 ? b : d;
  d !== void 0 && b instanceof D && (b = a.Aa(b), Ic(a, b, d));
  hd(a, 4, b);
  throw xa;
}
function hd(a, b, d, c) {
  if (b === 0) throw TypeError("Should not unwind for NORMAL completions");
  var e = a.o;
  a: for (; 0 < e.length; e.pop()) {
    var h = e[e.length - 1];
    switch (h.node.type) {
      case "TryStatement":
        h.ea = {
          type: b,
          value: d,
          label: c
        };
        return;
      case "CallExpression":
      case "NewExpression":
        if (b === 3) {
          h.value = d;
          return;
        }
        if (b !== 4) throw Error("Unsynatctic break/continue not rejected by Acorn");
        break;
      case "Program":
        h.done = true;
        break a;
    }
    if (b === 1) {
      if (c ? h.labels && h.labels.indexOf(c) !== -1 : h.W || h.Zb) {
        e.pop();
        return;
      }
    } else if (b === 2 && (c ? h.labels && h.labels.indexOf(c) !== -1 : h.W)) return;
  }
  Q(a, d, a.D) ? (b = {
    EvalError,
    RangeError,
    ReferenceError,
    SyntaxError,
    TypeError,
    URIError
  }, c = String(a.G(d, "name")), e = a.G(d, "message").valueOf(), b = (b[c] || Error)(e), b.stack = String(a.G(d, "stack"))) : b = String(d);
  a.value = b;
  throw b;
}
function R(a, b) {
  switch (b.type) {
    case "ArrayExpression":
      return "[...]";
    case "BinaryExpression":
    case "LogicalExpression":
      return R(a, b.left) + " " + b.operator + " " + R(a, b.right);
    case "CallExpression":
      return R(a, b.callee) + "(...)";
    case "ConditionalExpression":
      return R(a, b.test) + " ? " + R(a, b.da) + " : " + R(a, b.alternate);
    case "Identifier":
      return b.name;
    case "Literal":
      return b.raw;
    case "MemberExpression":
      var d = R(a, b.object);
      a = R(a, b.Wa);
      return b.bb ? d + "[" + a + "]" : d + "." + a;
    case "NewExpression":
      return "new " + R(a, b.callee) + "(...)";
    case "ObjectExpression":
      return "{...}";
    case "ThisExpression":
      return "this";
    case "UnaryExpression":
      return b.operator + " " + R(a, b.K);
    case "UpdateExpression":
      return d = R(a, b.K), b.prefix ? b.operator + d : d + b.operator;
  }
  return "???";
}
function Lb(a, b, d) {
  var c = a.o[a.o.length - 1],
    e = Array.from(d),
    h = e.shift();
  d = Math.max(Number(e.shift() || 0), 0);
  var k = a.ya();
  if (h instanceof D && h.H === "Function") {
    var q = h;
    k.type = "CallExpression";
    c = c.scope;
  } else {
    try {
      var C = da(String(h), "taskCode" + a.ic++);
    } catch (U) {
      K(a, a.T, "Invalid code: " + U.message);
    }
    k.type = "EvalProgram_";
    k.body = C.body;
    c = c.node.arguments[0];
    fa(k, c ? c.start : void 0, c ? c.end : void 0);
    c = a.N;
    e.length = 0;
  }
  b = new id(q, e, c, k, b ? d : -1);
  ab(a, b, d);
  return b.Db;
}
function ab(a, b, d) {
  b.time = Date.now() + d;
  a.ca.push(b);
  a.ca.sort(function (c, e) {
    return c.time - e.time;
  });
}
function Mb(a, b) {
  for (var d = 0; d < a.ca.length; d++) if (a.ca[d].Db == b) {
    a.ca.splice(d, 1);
    break;
  }
}
function jd(a, b, d) {
  if (!a.P) throw Error("Unexpected call to createGetter");
  a.P = false;
  d = Array.isArray(d) ? d[0] : d;
  var c = a.ya();
  c.type = "CallExpression";
  a = new u(c, a.o[a.o.length - 1].scope);
  a.ia = 2;
  a.B = d;
  a.U = b;
  a.Qa = true;
  a.F = [];
  return a;
}
function kd(a, b, d, c) {
  if (!a.Ka) throw Error("Unexpected call to createSetter");
  a.Ka = false;
  d = Array.isArray(d) ? d[0] : a.Na;
  var e = a.ya();
  e.type = "CallExpression";
  a = new u(e, a.o[a.o.length - 1].scope);
  a.ia = 2;
  a.B = d;
  a.U = b;
  a.Qa = true;
  a.F = [c];
  return a;
}
function ld(a, b) {
  return b === void 0 || b === null ? a.Na : b instanceof D ? b : (a = a.s(Ac(a, b)), a.data = b, a);
}
p.Xb = function () {
  return this.N;
};
p.Yb = function () {
  return this.o;
};
p.ec = function (a) {
  this.o = a;
};
function u(a, b) {
  this.node = a;
  this.scope = b;
}
function bd(a, b, d) {
  this.Va = a;
  this.S = b;
  this.object = d;
}
function D(a) {
  this.V = Object.create(null);
  this.Y = Object.create(null);
  this.h = Object.create(null);
  this.xa = a;
}
p = D.prototype;
p.xa = null;
p.H = "Object";
p.data = null;
p.toString = function () {
  if (!Ma) return "[object Interpreter.Object]";
  if (!(this instanceof D)) return String(this);
  if (this.H === "Array") {
    var a = Ka;
    a.push(this);
    try {
      var b = [],
        d = this.h.length,
        c = false;
      1024 < d && (d = 1e3, c = true);
      for (var e = 0; e < d; e++) {
        var h = this.h[e];
        b[e] = h instanceof D && a.indexOf(h) !== -1 ? "..." : h;
      }
      c && b.push("...");
    } finally {
      a.pop();
    }
    return b.join(",");
  }
  if (this.H === "Error") {
    a = Ka;
    if (a.indexOf(this) !== -1) return "[object Error]";
    d = this;
    do if ("name" in d.h) {
      b = d.h.name;
      break;
    } while (d = d.xa);
    d = this;
    do if ("message" in d.h) {
      c = d.h.message;
      break;
    } while (d = d.xa);
    a.push(this);
    try {
      b = b && String(b), c = c && String(c);
    } finally {
      a.pop();
    }
    return c ? b + ": " + c : String(b);
  }
  return this.data !== null ? String(this.data) : "[object " + this.H + "]";
};
p.valueOf = function () {
  return !Ma || this.data === void 0 || this.data === null || this.data instanceof RegExp ? this : this.data instanceof Date ? this.data.valueOf() : this.data;
};
function id(a, b, d, c, e) {
  this.zb = a;
  this.Lb = b;
  this.scope = d;
  this.node = c;
  this.interval = e;
  this.Db = ++md;
  this.time = 0;
}
var md = 0;
t.prototype.stepArrayExpression = function (a, b, d) {
  d = d.elements;
  var c = b.A || 0;
  b.Oa ? (this.g(b.Oa, c, b.value), c++) : (b.Oa = Cc(this), b.Oa.h.length = d.length);
  for (; c < d.length;) {
    if (d[c]) return b.A = c, new u(d[c], b.scope);
    c++;
  }
  a.pop();
  a[a.length - 1].value = b.Oa;
};
t.prototype.stepAssignmentExpression = function (a, b, d) {
  if (!b.ja) return b.ja = true, b = new u(d.left, b.scope), b.sa = true, b;
  if (!b.Da) {
    b.Fa || (b.Fa = b.value);
    b.Ba && (b.ma = b.value);
    if (!b.Ba && d.operator !== "=" && (a = fd(this, b.Fa), b.ma = a, this.P)) return b.Ba = true, jd(this, a, b.Fa);
    b.Da = true;
    d.operator === "=" && d.left.type === "Identifier" && (b.Pa = d.left.name);
    return new u(d.right, b.scope);
  }
  if (b.ta) a.pop(), a[a.length - 1].value = b.ib;else {
    var c = b.ma,
      e = b.value;
    switch (d.operator) {
      case "=":
        c = e;
        break;
      case "+=":
        c += e;
        break;
      case "-=":
        c -= e;
        break;
      case "*=":
        c *= e;
        break;
      case "/=":
        c /= e;
        break;
      case "%=":
        c %= e;
        break;
      case "<<=":
        c <<= e;
        break;
      case ">>=":
        c >>= e;
        break;
      case ">>>=":
        c >>>= e;
        break;
      case "&=":
        c &= e;
        break;
      case "^=":
        c ^= e;
        break;
      case "|=":
        c |= e;
        break;
      default:
        throw SyntaxError("Unknown assignment expression: " + d.operator);
    }
    if (d = gd(this, b.Fa, c)) return b.ta = true, b.ib = c, kd(this, d, b.Fa, c);
    a.pop();
    a[a.length - 1].value = c;
  }
};
t.prototype.stepBinaryExpression = function (a, b, d) {
  if (!b.ja) return b.ja = true, new u(d.left, b.scope);
  if (!b.Da) return b.Da = true, b.ma = b.value, new u(d.right, b.scope);
  a.pop();
  var c = b.ma;
  b = b.value;
  switch (d.operator) {
    case "==":
      d = c == b;
      break;
    case "!=":
      d = c != b;
      break;
    case "===":
      d = c === b;
      break;
    case "!==":
      d = c !== b;
      break;
    case ">":
      d = c > b;
      break;
    case ">=":
      d = c >= b;
      break;
    case "<":
      d = c < b;
      break;
    case "<=":
      d = c <= b;
      break;
    case "+":
      d = c + b;
      break;
    case "-":
      d = c - b;
      break;
    case "*":
      d = c * b;
      break;
    case "/":
      d = c / b;
      break;
    case "%":
      d = c % b;
      break;
    case "&":
      d = c & b;
      break;
    case "|":
      d = c | b;
      break;
    case "^":
      d = c ^ b;
      break;
    case "<<":
      d = c << b;
      break;
    case ">>":
      d = c >> b;
      break;
    case ">>>":
      d = c >>> b;
      break;
    case "in":
      b instanceof D || K(this, this.j, "'in' expects an object, not '" + b + "'");
      d = $c(this, b, c);
      break;
    case "instanceof":
      Q(this, b, this.O) || K(this, this.j, "'instanceof' expects an object, not '" + b + "'");
      d = c instanceof D ? Q(this, c, b) : false;
      break;
    default:
      throw SyntaxError("Unknown binary operator: " + d.operator);
  }
  a[a.length - 1].value = d;
};
t.prototype.stepBlockStatement = function (a, b, d) {
  var c = b.A || 0;
  if (d = d.body[c]) return b.A = c + 1, new u(d, b.scope);
  a.pop();
};
t.prototype.stepBreakStatement = function (a, b, d) {
  hd(this, 1, void 0, d.label && d.label.name);
};
t.prototype.Hb = 0;
t.prototype.stepCallExpression = function (a, b, d) {
  if (!b.ia) {
    b.ia = 1;
    var c = new u(d.callee, b.scope);
    c.sa = true;
    return c;
  }
  if (b.ia === 1) {
    b.ia = 2;
    var e = b.value;
    if (Array.isArray(e)) {
      if (b.U = fd(this, e), e[0] === Ha ? b.Pb = e[1] === "eval" : b.B = e[0], e = b.U, this.P) return b.ia = 1, jd(this, e, b.value);
    } else b.U = e;
    b.F = [];
    b.A = 0;
  }
  e = b.U;
  if (!b.Qa) {
    b.A !== 0 && b.F.push(b.value);
    if (d.arguments[b.A]) return new u(d.arguments[b.A++], b.scope);
    if (d.type === "NewExpression") {
      e instanceof D && !e.Ab || K(this, this.j, R(this, d.callee) + " is not a constructor");
      if (e === this.qa) b.B = Cc(this);else {
        var h = e.h.prototype;
        if (typeof h !== "object" || h === null) h = this.M;
        b.B = this.s(h);
      }
      b.isConstructor = true;
    }
    b.Qa = true;
  }
  if (b.eb) a.pop(), a[a.length - 1].value = b.isConstructor && typeof b.value !== "object" ? b.B : b.value;else {
    b.eb = true;
    e instanceof D || K(this, this.j, R(this, d.callee) + " is not a function");
    if (a = e.node) {
      d = ea(this, a.body, e.Va);
      c = Cc(this);
      for (e = 0; e < b.F.length; e++) this.g(c, e, b.F[e]);
      this.g(d.object, "arguments", c);
      for (e = 0; e < a.oa.length; e++) this.g(d.object, a.oa[e].name, b.F.length > e ? b.F[e] : void 0);
      d.S || (b.B = ld(this, b.B));
      this.g(d.object, "this", b.B, ua);
      b.value = void 0;
      return new u(a.body, d);
    }
    if (e.eval) {
      if (e = b.F[0], typeof e !== "string") b.value = e;else {
        try {
          c = da(String(e), "eval" + this.Hb++);
        } catch (q) {
          K(this, this.T, "Invalid code: " + q.message);
        }
        e = this.ya();
        e.type = "EvalProgram_";
        e.body = c.body;
        fa(e, d.start, d.end);
        d = b.Pb ? b.scope : this.N;
        d.S ? d = ea(this, c, d) : Ra(this, c, d);
        this.value = void 0;
        return new u(e, d);
      }
    } else if (e.Ta) b.scope.S || (b.B = ld(this, b.B)), b.value = e.Ta.apply(b.B, b.F);else if (e.Za) {
      var k = this;
      c = e.Za.length - 1;
      c = b.F.concat(Array(c)).slice(0, c);
      c.push(function (q) {
        b.value = q;
        k.za = false;
      });
      this.za = true;
      b.scope.S || (b.B = ld(this, b.B));
      e.Za.apply(b.B, c);
    } else K(this, this.j, R(this, d.callee) + " is not callable");
  }
};
t.prototype.stepConditionalExpression = function (a, b, d) {
  var c = b.na || 0;
  if (c === 0) return b.na = 1, new u(d.test, b.scope);
  if (c === 1) {
    b.na = 2;
    if ((c = !!b.value) && d.da) return new u(d.da, b.scope);
    if (!c && d.alternate) return new u(d.alternate, b.scope);
    this.value = void 0;
  }
  a.pop();
  d.type === "ConditionalExpression" && (a[a.length - 1].value = b.value);
};
t.prototype.stepContinueStatement = function (a, b, d) {
  hd(this, 2, void 0, d.label && d.label.name);
};
t.prototype.stepDebuggerStatement = function (a) {
  a.pop();
};
t.prototype.stepDoWhileStatement = function (a, b, d) {
  d.type === "DoWhileStatement" && b.ga === void 0 && (b.value = true, b.ga = true);
  if (!b.ga) return b.ga = true, new u(d.test, b.scope);
  if (!b.value) a.pop();else if (d.body) return b.ga = false, b.W = true, new u(d.body, b.scope);
};
t.prototype.stepEmptyStatement = function (a) {
  a.pop();
};
t.prototype.stepEvalProgram_ = function (a, b, d) {
  var c = b.A || 0;
  if (d = d.body[c]) return b.A = c + 1, new u(d, b.scope);
  a.pop();
  a[a.length - 1].value = this.value;
};
t.prototype.stepExpressionStatement = function (a, b, d) {
  if (!b.ka) return this.value = void 0, b.ka = true, new u(d.la, b.scope);
  a.pop();
  this.value = b.value;
};
t.prototype.stepForInStatement = function (a, b, d) {
  if (!b.Ub && (b.Ub = true, d.left.fa && d.left.fa[0].ua)) return b.scope.S && K(this, this.T, "for-in loop variable declaration may not have an initializer"), new u(d.left, b.scope);
  if (!b.Ca) return b.Ca = true, b.pa || (b.pa = b.value), new u(d.right, b.scope);
  b.W || (b.W = true, b.u = b.value, b.kb = Object.create(null));
  if (b.Ra === void 0) a: for (;;) {
    if (b.u instanceof D) for (b.wa || (b.wa = Object.getOwnPropertyNames(b.u.h));;) {
      var c = b.wa.shift();
      if (c === void 0) break;
      if (Object.prototype.hasOwnProperty.call(b.u.h, c) && !b.kb[c] && (b.kb[c] = true, Object.prototype.propertyIsEnumerable.call(b.u.h, c))) {
        b.Ra = c;
        break a;
      }
    } else if (b.u !== null && b.u !== void 0) for (b.wa || (b.wa = Object.getOwnPropertyNames(b.u));;) {
      c = b.wa.shift();
      if (c === void 0) break;
      b.kb[c] = true;
      if (Object.prototype.propertyIsEnumerable.call(b.u, c)) {
        b.Ra = c;
        break a;
      }
    }
    b.u = Ac(this, b.u);
    b.wa = null;
    if (b.u === null) {
      a.pop();
      return;
    }
  }
  if (!b.wb) if (b.wb = true, a = d.left, a.type === "VariableDeclaration") b.pa = [Ha, a.fa[0].id.name];else return b.pa = null, b = new u(a, b.scope), b.sa = true, b;
  b.pa || (b.pa = b.value);
  if (!b.ta && (b.ta = true, a = b.Ra, c = gd(this, b.pa, a))) return kd(this, c, b.pa, a);
  b.Ra = void 0;
  b.wb = false;
  b.ta = false;
  if (d.body) return new u(d.body, b.scope);
};
t.prototype.stepForStatement = function (a, b, d) {
  switch (b.na) {
    default:
      b.na = 1;
      if (d.ua) return new u(d.ua, b.scope);
      break;
    case 1:
      b.na = 2;
      if (d.test) return new u(d.test, b.scope);
      break;
    case 2:
      b.na = 3;
      if (d.test && !b.value) a.pop();else return b.W = true, new u(d.body, b.scope);
      break;
    case 3:
      if (b.na = 1, d.update) return new u(d.update, b.scope);
  }
};
t.prototype.stepFunctionDeclaration = function (a) {
  a.pop();
};
t.prototype.stepFunctionExpression = function (a, b, d) {
  a.pop();
  b = a[a.length - 1];
  a = b.scope;
  d.id && (a = cd(this, a));
  b.value = Nb(this, d, a, b.Pa);
  d.id && this.g(a.object, d.id.name, b.value, ua);
};
t.prototype.stepIdentifier = function (a, b, d) {
  a.pop();
  if (b.sa) a[a.length - 1].value = [Ha, d.name];else {
    b = dd(this, d.name);
    if (this.P) return jd(this, b, this.Na);
    a[a.length - 1].value = b;
  }
};
t.prototype.stepIfStatement = t.prototype.stepConditionalExpression;
t.prototype.stepLabeledStatement = function (a, b, d) {
  a.pop();
  a = b.labels || [];
  a.push(d.label.name);
  b = new u(d.body, b.scope);
  b.labels = a;
  return b;
};
t.prototype.stepLiteral = function (a, b, d) {
  a.pop();
  b = d.value;
  b instanceof RegExp && (d = this.s(this.Ma), Hc(this, d, b), b = d);
  a[a.length - 1].value = b;
};
t.prototype.stepLogicalExpression = function (a, b, d) {
  if (d.operator !== "&&" && d.operator !== "||") throw SyntaxError("Unknown logical operator: " + d.operator);
  if (!b.ja) return b.ja = true, new u(d.left, b.scope);
  if (b.Da) a.pop(), a[a.length - 1].value = b.value;else if (d.operator === "&&" && !b.value || d.operator === "||" && b.value) a.pop(), a[a.length - 1].value = b.value;else return b.Da = true, new u(d.right, b.scope);
};
t.prototype.stepMemberExpression = function (a, b, d) {
  if (!b.Ca) return b.Ca = true, new u(d.object, b.scope);
  if (d.bb) {
    if (b.Vb) d = b.value;else return b.u = b.value, b.Vb = true, new u(d.Wa, b.scope);
  } else b.u = b.value, d = d.Wa.name;
  a.pop();
  if (b.sa) a[a.length - 1].value = [b.u, d];else {
    d = this.G(b.u, d);
    if (this.P) return jd(this, d, b.u);
    a[a.length - 1].value = d;
  }
};
t.prototype.stepNewExpression = t.prototype.stepCallExpression;
t.prototype.stepObjectExpression = function (a, b, d) {
  var c = b.A || 0,
    e = d.h[c];
  if (b.u) {
    var h = b.Pa;
    b.Ja[h] || (b.Ja[h] = {});
    b.Ja[h][e.kind] = b.value;
    b.A = ++c;
    e = d.h[c];
  } else b.u = this.s(this.M), b.Ja = Object.create(null);
  if (e) {
    var k = e.key;
    if (k.type === "Identifier") h = k.name;else if (k.type === "Literal") h = k.value;else throw SyntaxError("Unknown object structure: " + k.type);
    b.Pa = h;
    return new u(e.value, b.scope);
  }
  for (k in b.Ja) d = b.Ja[k], "get" in d || "set" in d ? this.g(b.u, k, Ia, {
    configurable: true,
    enumerable: true,
    get: d.get,
    set: d.set
  }) : this.g(b.u, k, d.init);
  a.pop();
  a[a.length - 1].value = b.u;
};
t.prototype.stepProgram = function (a, b, d) {
  if (a = d.body.shift()) return b.done = false, new u(a, b.scope);
  b.done = true;
};
t.prototype.stepReturnStatement = function (a, b, d) {
  if (d.K && !b.ka) return b.ka = true, new u(d.K, b.scope);
  hd(this, 3, b.value);
};
t.prototype.stepSequenceExpression = function (a, b, d) {
  var c = b.A || 0;
  if (d = d.xb[c]) return b.A = c + 1, new u(d, b.scope);
  a.pop();
  a[a.length - 1].value = b.value;
};
t.prototype.stepSwitchStatement = function (a, b, d) {
  if (!b.ga) return b.ga = 1, new u(d.Qb, b.scope);
  b.ga === 1 && (b.ga = 2, b.hc = b.value, b.cb = -1);
  for (;;) {
    var c = b.gb || 0,
      e = d.tb[c];
    if (b.Ha || !e || e.test) {
      if (e || b.Ha || b.cb === -1) {
        if (e) {
          if (!b.Ha && !b.Fb && e.test) return b.Fb = true, new u(e.test, b.scope);
          if (b.Ha || b.value === b.hc) {
            b.Ha = true;
            var h = b.A || 0;
            if (e.da[h]) return b.Zb = true, b.A = h + 1, new u(e.da[h], b.scope);
          }
          b.Fb = false;
          b.A = 0;
          b.gb = c + 1;
        } else {
          a.pop();
          break;
        }
      } else b.Ha = true, b.gb = b.cb;
    } else b.cb = c, b.gb = c + 1;
  }
};
t.prototype.stepThisExpression = function (a) {
  a.pop();
  a[a.length - 1].value = dd(this, "this");
};
t.prototype.stepThrowStatement = function (a, b, d) {
  if (b.ka) K(this, b.value);else return b.ka = true, new u(d.K, b.scope);
};
t.prototype.stepTryStatement = function (a, b, d) {
  if (!b.Rb) return b.Rb = true, new u(d.block, b.scope);
  if (b.ea && b.ea.type === 4 && !b.Tb && d.Ea) return b.Tb = true, a = cd(this, b.scope), this.g(a.object, d.Ea.Ua.name, b.ea.value), b.ea = void 0, new u(d.Ea.body, a);
  if (!b.Sb && d.fb) return b.Sb = true, new u(d.fb, b.scope);
  a.pop();
  b.ea && hd(this, b.ea.type, b.ea.value, b.ea.label);
};
t.prototype.stepUnaryExpression = function (a, b, d) {
  if (!b.ka) return b.ka = true, a = new u(d.K, b.scope), a.sa = d.operator === "delete", a;
  a.pop();
  var c = b.value;
  switch (d.operator) {
    case "-":
      c = -c;
      break;
    case "+":
      c = +c;
      break;
    case "!":
      c = !c;
      break;
    case "~":
      c = ~c;
      break;
    case "delete":
      d = true;
      if (Array.isArray(c)) {
        var e = c[0];
        e === Ha && (e = b.scope);
        c = String(c[1]);
        try {
          delete e.h[c];
        } catch (h) {
          b.scope.S ? K(this, this.j, "Cannot delete property '" + c + "' of '" + e + "'") : d = false;
        }
      }
      c = d;
      break;
    case "typeof":
      c = c && c.H === "Function" ? "function" : typeof c;
      break;
    case "void":
      c = void 0;
      break;
    default:
      throw SyntaxError("Unknown unary operator: " + d.operator);
  }
  a[a.length - 1].value = c;
};
t.prototype.stepUpdateExpression = function (a, b, d) {
  if (!b.ja) return b.ja = true, a = new u(d.K, b.scope), a.sa = true, a;
  b.Ga || (b.Ga = b.value);
  b.Ba && (b.ma = b.value);
  if (!b.Ba) {
    var c = fd(this, b.Ga);
    b.ma = c;
    if (this.P) return b.Ba = true, jd(this, c, b.Ga);
  }
  if (b.ta) a.pop(), a[a.length - 1].value = b.ib;else {
    c = Number(b.ma);
    if (d.operator === "++") var e = c + 1;else if (d.operator === "--") e = c - 1;else throw SyntaxError("Unknown update expression: " + d.operator);
    d = d.prefix ? e : c;
    if (c = gd(this, b.Ga, e)) return b.ta = true, b.ib = d, kd(this, c, b.Ga, e);
    a.pop();
    a[a.length - 1].value = d;
  }
};
t.prototype.stepVariableDeclaration = function (a, b, d) {
  d = d.fa;
  var c = b.A || 0,
    e = d[c];
  b.Bb && e && (ed(this, e.id.name, b.value), b.Bb = false, e = d[++c]);
  for (; e;) {
    if (e.ua) return b.A = c, b.Bb = true, b.Pa = e.id.name, new u(e.ua, b.scope);
    e = d[++c];
  }
  a.pop();
};
t.prototype.stepWithStatement = function (a, b, d) {
  if (!b.Ca) return b.Ca = true, new u(d.object, b.scope);
  a.pop();
  a = cd(this, b.scope, b.value);
  return new u(d.body, a);
};
t.prototype.stepWhileStatement = t.prototype.stepDoWhileStatement;
Na.Interpreter = t;
t.prototype.step = t.prototype.lb;
t.prototype.run = t.prototype.Eb;
t.prototype.appendCode = t.prototype.Jb;
t.prototype.createObject = t.prototype.Aa;
t.prototype.createObjectProto = t.prototype.s;
t.prototype.createAsyncFunction = t.prototype.ub;
t.prototype.createNativeFunction = t.prototype.i;
t.prototype.getProperty = t.prototype.G;
t.prototype.setProperty = t.prototype.g;
t.prototype.nativeToPseudo = t.prototype.Ia;
t.prototype.pseudoToNative = t.prototype.R;
t.prototype.getGlobalScope = t.prototype.Xb;
t.prototype.getStateStack = t.prototype.Yb;
t.prototype.setStateStack = t.prototype.ec;
t.VALUE_IN_DESCRIPTOR = Ia;
var stdin_default = t;
export { stdin_default as default }