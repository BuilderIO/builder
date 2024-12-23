import React, { useState, useEffect, useCallback } from 'react';
import appState from "@builder.io/app-context";
import pkg from "../../../package.json";
import classNames from 'classnames';
import styles from './GlobalLinkConfigForm.module.css';
import { CTA_TEXT } from '../../constants';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';

const fieldLabels = {
    globallinkUrl: 'GlobalLink URL',
    connectorsKey: 'Connector Keys',
    apiKey: 'API Key'
};

export const GlobalLinkConfigForm = () => {
    const [formData, setFormData] = useState({
        globallinkUrl: '',
        connectorsKey: '',
        apiKey: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const isDarkMode = appState.theme.isDarkMode;

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;

        setFormData(prevData => ({ ...prevData, [name]: value }));
    }, []);

    const clickConnectButton = useCallback(() => {
        const dialogElement = document.getElementById('global-dialog');
        if (!dialogElement) {
            console.error('Dialog element not found');
            return;
        }

        const buttons = dialogElement.querySelectorAll('button');
        const connectButton = Array.from(buttons).find(button =>
            button.textContent.includes(CTA_TEXT)
        );

        if (!connectButton) {
            console.error('Connect button not found in the modal');
            return;
        }

        connectButton.click();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const pluginSettings = appState.user.organization.value.settings.plugins.get(pkg.name);
        pluginSettings.set("Globallinkurl", formData.globallinkUrl);
        pluginSettings.set("connectorKey", formData.connectorsKey);
        pluginSettings.set("apiKey", formData.apiKey);
        clickConnectButton();
    }

    useEffect(() => {
        const pluginSettings = appState.user.organization.value.settings.plugins.get(pkg.name);
        setFormData({
            globallinkUrl: pluginSettings.get("Globallinkurl") || '',
            connectorsKey: pluginSettings.get("connectorKey") || '',
            apiKey: pluginSettings.get("apiKey") || '',
        });

        let isFirstRender = true;

        const observer = new MutationObserver((mutations) => {
            const globalDialog = mutations.flatMap(m => Array.from(m.addedNodes))
                .find(node => node.id === 'global-dialog');

            if (!globalDialog) return;

            globalDialog.style.display = 'none';
            observer.disconnect();
            setIsLoading(false);

            if (!isFirstRender) {
                setTimeout(() => {
                    globalDialog.style.display = '';
                    clickConnectButton();
                }, 100);
            }
            isFirstRender = false;
        });

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
            appState.globalState.showPluginDialog(pkg.name);
        }, 0);

        return () => {
            observer.disconnect();
            setIsLoading(false);
        };
    }, [clickConnectButton]);

    if (isLoading) {
        return (
            <div className={styles.spinnerContainer}>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <form className={classNames(styles.form, { [styles.darkMode]: isDarkMode })} onSubmit={handleSubmit}>
            <div className={styles.formContainer}>
                {Object.entries(fieldLabels).map(([field, label]) => (
                    <div key={field} className={styles.inputGroup}>
                        <label className={styles.label} htmlFor={field}>{label}</label>
                        <input
                            className={styles.input}
                            type="text"
                            id={field}
                            name={field}
                            value={formData[field]}
                            onChange={handleInputChange}
                        />
                        <span className={styles.hint}>Enter the {label}</span>
                    </div>
                ))}
                <button className={styles.button} type="submit">{CTA_TEXT}</button>
            </div>
        </form>
    );
};
