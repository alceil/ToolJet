import React, { createContext, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/_ui/Layout';
import { globalDatasourceService, appEnvironmentService, authenticationService } from '@/_services';
import { GlobalDataSourcesPage } from './GlobalDataSourcesPage';

export const GlobalDataSourcesContext = createContext({
  showDataSourceManagerModal: false,
  toggleDataSourceManagerModal: () => {},
  selectedDataSource: null,
  setSelectedDataSource: () => {},
});

export const GlobalDatasources = (props) => {
  const { admin } = authenticationService.currentSessionValue;
  const [selectedDataSource, setSelectedDataSource] = useState(null);
  const [dataSources, setDataSources] = useState([]);
  const [showDataSourceManagerModal, toggleDataSourceManagerModal] = useState(false);
  const [isEditing, setEditing] = useState(true);
  const [environments, setEnvironments] = useState([]);
  const [currentEnvironment, setCurrentEnvironment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!admin) {
      navigate('/');
    }
    fetchEnvironments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  const fetchDataSources = async (resetSelection = false, dataSource = null) => {
    globalDatasourceService
      .getAll()
      .then((data) => {
        const orderedDataSources = data.data_sources.sort((a, b) => a.name.localeCompare(b.name));
        setDataSources([...(orderedDataSources ?? [])]);
        const ds = dataSource && orderedDataSources.find((ds) => ds.id === dataSource.id);

        if (!resetSelection && ds) {
          setEditing(true);
          setSelectedDataSource(ds);
          toggleDataSourceManagerModal(true);
        }
        if (orderedDataSources.length && resetSelection) {
          setSelectedDataSource(orderedDataSources[0]);
          toggleDataSourceManagerModal(true);
        }
      })
      .catch(() => {
        setDataSources([]);
      });
  };

  const handleToggleSourceManagerModal = () => {
    toggleDataSourceManagerModal(
      (prevState) => !prevState,
      () => setEditing((prev) => !prev)
    );
  };

  const handleModalVisibility = () => {
    if (selectedDataSource) {
      return setSelectedDataSource(null, () => handleToggleSourceManagerModal());
    }

    handleToggleSourceManagerModal();
  };

  const fetchEnvironments = () => {
    appEnvironmentService.getAllEnvironments().then((data) => {
      const envArray = data?.environments;
      setEnvironments(envArray);
      if (envArray.length > 0) {
        const env = envArray.find((env) => env.is_default === true);
        setCurrentEnvironment(env);
      }
    });
  };

  const value = useMemo(
    () => ({
      selectedDataSource,
      setSelectedDataSource,
      fetchDataSources,
      dataSources,
      showDataSourceManagerModal,
      toggleDataSourceManagerModal,
      handleModalVisibility,
      isEditing,
      setEditing,
      fetchEnvironments,
      environments,
      currentEnvironment,
      setCurrentEnvironment,
      setDataSources,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDataSource, dataSources, showDataSourceManagerModal, isEditing, environments, currentEnvironment]
  );

  return (
    <Layout switchDarkMode={props.switchDarkMode} darkMode={props.darkMode}>
      <GlobalDataSourcesContext.Provider value={value}>
        <div className="page-wrapper">
          <GlobalDataSourcesPage darkMode={props.darkMode} />
        </div>
      </GlobalDataSourcesContext.Provider>
    </Layout>
  );
};
