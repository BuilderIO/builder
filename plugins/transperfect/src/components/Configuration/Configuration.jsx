/** @jsx jsx */
import React, { useState } from "react";
import { jsx, css } from "@emotion/react";
import { GlobalLinkConfigForm } from "../GlobalLinkConfigForm/GlobalLinkConfigForm";
import { styles } from "./style";
import Dashboard from "../Dashboard/Dashboard";

const GlobalLinkConfig = () => {
  return (
    <div css={styles.formContainer}>
      <GlobalLinkConfigForm />
    </div>
  );
};

export const Configuration = () => {
  const [activeTab, setActiveTab] = useState('config');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'config':
        return <GlobalLinkConfig />;
      case 'dashboard':
        return <div style={{ padding: 20, height: '100%', width: '100%' }}><Dashboard /></div>
      default:
        return null;
    }
  };

  return (
    <div css={styles.container}>
      {/* <header css={styles.header}>
        <img src={Logo} alt="GlobalLink Logo" css={styles.logo} />
      </header> */}
      <div css={styles.tabContainer}>
        <button
          css={styles.tabButton}
          className={activeTab === 'config' ? 'active' : ''}
          onClick={() => setActiveTab('config')}
        >
          GlobalLink Configuration
        </button>
        <button
          css={styles.tabButton}
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          GlobalLink Dashboard
        </button>
      </div>
      <div css={styles.content}>
        {renderTabContent()}
      </div>
    </div>
  );
};
