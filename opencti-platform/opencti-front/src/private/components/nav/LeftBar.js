import React, { useState } from 'react';
import * as PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { assoc, compose } from 'ramda';
import { withStyles, withTheme } from '@mui/styles';
import Toolbar from '@mui/material/Toolbar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Collapse from '@mui/material/Collapse';
import { AssignmentOutlined, BuildOutlined, DashboardOutlined, ExpandLess, ExpandMore, LayersOutlined, PlaceOutlined } from '@mui/icons-material';
import { Binoculars, Brain, CogOutline, Database, FlaskOutline, FolderTableOutline, GlobeModel, Timetable } from 'mdi-material-ui';
import inject18n from '../../../components/i18n';
import { UserContext } from '../../../utils/hooks/useAuth';
import Security from '../../../utils/Security';
import useGranted, { KNOWLEDGE, MODULES, SETTINGS, TAXIIAPI_SETCOLLECTIONS } from '../../../utils/hooks/useGranted';

const styles = (theme) => ({
  drawerPaper: {
    minHeight: '100vh',
    width: 180,
    background: 0,
    backgroundColor: theme.palette.background.nav,
  },
  menuList: {
    height: '100%',
  },
  lastItem: {
    bottom: 0,
  },
  logoButton: {
    marginLeft: -23,
    marginRight: 20,
  },
  logo: {
    cursor: 'pointer',
    height: 35,
  },
  toolbar: theme.mixins.toolbar,
  menuItem: {
    height: 35,
    fontWeight: 500,
    fontSize: 14,
  },
  menuItemNested: {
    height: 30,
    paddingLeft: 35,
  },
  menuItemText: {
    paddingTop: 1,
    fontWeight: 500,
    fontSize: 14,
  },
  menuItemNestedText: {
    paddingTop: 1,
    fontWeight: 500,
    fontSize: 14,
    color: theme.palette.text.secondary,
  },
});

const LeftBar = ({ t, location, classes, theme }) => {
  const [open, setOpen] = useState({ activities: true, knowledge: true });
  const isGrantedToKnowledge = useGranted([KNOWLEDGE]);
  const isGrantedToModules = useGranted([MODULES]);

  const toggle = (key) => setOpen(assoc(key, !open[key], open));
  let toData;
  if (isGrantedToKnowledge) {
    toData = '/dashboard/data/entities';
  } else if (isGrantedToModules) {
    toData = '/dashboard/data/connectors';
  } else {
    toData = '/dashboard/data/taxii';
  }
  return (
    <UserContext.Consumer>
      {({ helper }) => {
        const hideThreats = helper.isEntityTypeHidden('Threats')
          || (helper.isEntityTypeHidden('Threat-Actor')
            && helper.isEntityTypeHidden('Intrusion-Set')
            && helper.isEntityTypeHidden('Campaign'));
        const hideEntities = helper.isEntityTypeHidden('Entities')
          || (helper.isEntityTypeHidden('Sector')
            && helper.isEntityTypeHidden('Country')
            && helper.isEntityTypeHidden('City')
            && helper.isEntityTypeHidden('Position')
            && helper.isEntityTypeHidden('Event')
            && helper.isEntityTypeHidden('Organization')
            && helper.isEntityTypeHidden('System')
            && helper.isEntityTypeHidden('Individual'));
        const hideArsenal = helper.isEntityTypeHidden('Arsenal')
          || (helper.isEntityTypeHidden('Channel')
            && helper.isEntityTypeHidden('Narrative')
            && helper.isEntityTypeHidden('Course-Of-Action')
            && helper.isEntityTypeHidden('Tool')
            && helper.isEntityTypeHidden('Vulnerability'));
        const hideTechniques = helper.isEntityTypeHidden('Techniques')
          || (helper.isEntityTypeHidden('Attack-Patterns')
            && helper.isEntityTypeHidden('Narratives')
            && helper.isEntityTypeHidden('Courses Of Action')
            && helper.isEntityTypeHidden('Data Component')
            && helper.isEntityTypeHidden('Data Source'));
        const hideLocations = helper.isEntityTypeHidden('Location')
          || (helper.isEntityTypeHidden('Region')
            && helper.isEntityTypeHidden('Countries')
            && helper.isEntityTypeHidden('Areas')
            && helper.isEntityTypeHidden('Cities')
            && helper.isEntityTypeHidden('Positions'));
        return (
          <Drawer variant="permanent" classes={{ paper: classes.drawerPaper }}>
            <Toolbar />
            <MenuList component="nav">
              <MenuItem
                component={Link}
                to="/dashboard"
                selected={location.pathname === '/dashboard'}
                dense={true}
                classes={{ root: classes.menuItem }}
              >
                <ListItemIcon style={{ minWidth: 30 }}>
                  <DashboardOutlined fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  classes={{ primary: classes.menuItemText }}
                  primary={t('Dashboard')}
                />
              </MenuItem>
              <Security needs={[KNOWLEDGE]}>
                <MenuItem
                  dense={true}
                  classes={{ root: classes.menuItem }}
                  onClick={() => toggle('activities')}
                >
                  <ListItemIcon style={{ minWidth: 30 }}>
                    <Brain fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    classes={{ primary: classes.menuItemText }}
                    primary={t('Activities')}
                  />
                  {open.activities ? <ExpandLess /> : <ExpandMore />}
                </MenuItem>
                <Collapse in={open.activities}>
                  <MenuList component="nav" disablePadding={true}>
                    <MenuItem
                      component={Link}
                      to="/dashboard/analysis"
                      selected={location.pathname.includes(
                        '/dashboard/analysis',
                      )}
                      dense={true}
                      classes={{ root: classes.menuItemNested }}
                    >
                      <ListItemIcon
                        style={{
                          minWidth: 30,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        <AssignmentOutlined fontSize="small" color="inherit" />
                      </ListItemIcon>
                      <ListItemText
                        classes={{ primary: classes.menuItemNestedText }}
                        primary={t('Analysis')}
                      />
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      to="/dashboard/events"
                      selected={location.pathname.includes('/dashboard/events')}
                      dense={true}
                      classes={{ root: classes.menuItemNested }}
                    >
                      <ListItemIcon
                        style={{
                          minWidth: 30,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        <Timetable fontSize="small" color="inherit" />
                      </ListItemIcon>
                      <ListItemText
                        classes={{ primary: classes.menuItemNestedText }}
                        primary={t('Events')}
                      />
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      to="/dashboard/observations"
                      selected={location.pathname.includes(
                        '/dashboard/observations',
                      )}
                      dense={true}
                      classes={{ root: classes.menuItemNested }}
                    >
                      <ListItemIcon
                        style={{
                          minWidth: 30,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        <Binoculars fontSize="small" color="inherit" />
                      </ListItemIcon>
                      <ListItemText
                        classes={{ primary: classes.menuItemNestedText }}
                        primary={t('Observations')}
                      />
                    </MenuItem>
                  </MenuList>
                </Collapse>
                <MenuItem
                  dense={true}
                  classes={{ root: classes.menuItem }}
                  onClick={() => toggle('knowledge')}
                >
                  <ListItemIcon style={{ minWidth: 30 }}>
                    <GlobeModel fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    classes={{ primary: classes.menuItemText }}
                    primary={t('Knowledge')}
                  />
                  {open.knowledge ? <ExpandLess /> : <ExpandMore />}
                </MenuItem>
                <Collapse in={open.knowledge}>
                  <MenuList component="nav" disablePadding={true}>
                    {!hideThreats && (
                      <MenuItem
                        component={Link}
                        to="/dashboard/threats"
                        selected={location.pathname.includes(
                          '/dashboard/threats',
                        )}
                        dense={true}
                        classes={{ root: classes.menuItemNested }}
                      >
                        <ListItemIcon
                          style={{
                            minWidth: 30,
                            color: theme.palette.text.secondary,
                          }}
                        >
                          <FlaskOutline fontSize="small" color="inherit" />
                        </ListItemIcon>
                        <ListItemText
                          classes={{ primary: classes.menuItemNestedText }}
                          primary={t('Threats')}
                        />
                      </MenuItem>
                    )}
                    {!hideArsenal && (
                      <MenuItem
                        component={Link}
                        to="/dashboard/arsenal"
                        selected={location.pathname.includes(
                          '/dashboard/arsenal',
                        )}
                        dense={true}
                        classes={{ root: classes.menuItemNested }}
                      >
                        <ListItemIcon
                          style={{
                            minWidth: 30,
                            color: theme.palette.text.secondary,
                          }}
                        >
                          <LayersOutlined fontSize="small" color="inherit" />
                        </ListItemIcon>
                        <ListItemText
                          classes={{ primary: classes.menuItemNestedText }}
                          primary={t('Arsenal')}
                        />
                      </MenuItem>
                    )}
                    {!hideTechniques && (
                      <MenuItem
                        component={Link}
                        to="/dashboard/techniques"
                        selected={location.pathname.includes(
                          '/dashboard/techniques',
                        )}
                        dense={true}
                        classes={{ root: classes.menuItemNested }}
                      >
                        <ListItemIcon
                          style={{
                            minWidth: 30,
                            color: theme.palette.text.secondary,
                          }}
                        >
                          <BuildOutlined fontSize="small" color="inherit" />
                        </ListItemIcon>
                        <ListItemText
                          classes={{ primary: classes.menuItemNestedText }}
                          primary={t('Techniques')}
                        />
                      </MenuItem>
                    )}
                    {!hideEntities && (
                      <MenuItem
                        component={Link}
                        to="/dashboard/entities"
                        selected={location.pathname.includes(
                          '/dashboard/entities',
                        )}
                        dense={true}
                        classes={{ root: classes.menuItemNested }}
                      >
                        <ListItemIcon
                          style={{
                            minWidth: 30,
                            color: theme.palette.text.secondary,
                          }}
                        >
                          <FolderTableOutline
                            fontSize="small"
                            color="inherit"
                          />
                        </ListItemIcon>
                        <ListItemText
                          classes={{ primary: classes.menuItemNestedText }}
                          primary={t('Entities')}
                        />
                      </MenuItem>
                    )}
                    {!hideLocations && (
                      <MenuItem
                        component={Link}
                        to="/dashboard/locations"
                        selected={location.pathname.includes(
                          '/dashboard/locations',
                        )}
                        dense={true}
                        classes={{ root: classes.menuItemNested }}
                      >
                        <ListItemIcon
                          style={{
                            minWidth: 30,
                            color: theme.palette.text.secondary,
                          }}
                        >
                          <PlaceOutlined
                            fontSize="small"
                            color="inherit"
                          />
                        </ListItemIcon>
                        <ListItemText
                          classes={{ primary: classes.menuItemNestedText }}
                          primary={t('Locations')}
                        />
                      </MenuItem>
                    )}
                  </MenuList>
                </Collapse>
              </Security>
            </MenuList>
            <Security
              needs={[SETTINGS, MODULES, KNOWLEDGE, TAXIIAPI_SETCOLLECTIONS]}
            >
              <Divider />
              <MenuList component="nav" disablePadding={true}>
                <Security needs={[MODULES, KNOWLEDGE, TAXIIAPI_SETCOLLECTIONS]}>
                  <MenuItem
                    component={Link}
                    to={toData}
                    selected={location.pathname.includes('/dashboard/data')}
                    dense={true}
                    classes={{ root: classes.menuItem }}
                  >
                    <ListItemIcon style={{ minWidth: 30 }}>
                      <Database fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      classes={{ primary: classes.menuItemText }}
                      primary={t('Data')}
                    />
                  </MenuItem>
                </Security>
                <Security needs={[SETTINGS]}>
                  <MenuItem
                    component={Link}
                    to="/dashboard/settings"
                    selected={location.pathname.includes('/dashboard/settings')}
                    dense={true}
                    classes={{ root: classes.menuItem }}
                    style={{ marginBottom: 50 }}
                  >
                    <ListItemIcon style={{ minWidth: 30 }}>
                      <CogOutline fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      classes={{ primary: classes.menuItemText }}
                      primary={t('Settings')}
                    />
                  </MenuItem>
                </Security>
              </MenuList>
            </Security>
          </Drawer>
        );
      }}
    </UserContext.Consumer>
  );
};

LeftBar.propTypes = {
  location: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
};

export default compose(
  inject18n,
  withRouter,
  withTheme,
  withStyles(styles),
)(LeftBar);
