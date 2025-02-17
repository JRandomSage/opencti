import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { graphql } from 'react-relay';
import withStyles from '@mui/styles/withStyles';
import withTheme from '@mui/styles/withTheme';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chart from 'react-apexcharts';
import { QueryRenderer } from '../../../../relay/environment';
import inject18n from '../../../../components/i18n';
import { polarAreaChartOptions } from '../../../../utils/Charts';
import { simpleNumberFormat } from '../../../../utils/Number';

const styles = () => ({
  paper: {
    height: '100%',
    margin: '10px 0 0 0',
    borderRadius: 6,
  },
  updateButton: {
    float: 'right',
    margin: '7px 10px 0 0',
  },
});

const entityStixCoreRelationshipsPolarAreaStixCoreRelationshipDistributionQuery = graphql`
  query EntityStixCoreRelationshipsPolarAreaStixCoreRelationshipDistributionQuery(
    $fromId: [String]
    $toId: [String]
    $fromTypes: [String]
    $toTypes: [String]
    $relationship_type: [String]
    $limit: Int
    $startDate: DateTime
    $endDate: DateTime
    $field: String!
    $dateAttribute: String
    $operation: StatsOperation!
    $isTo: Boolean
  ) {
    stixCoreRelationshipsDistribution(
      fromId: $fromId
      toId: $toId
      fromTypes: $fromTypes
      toTypes: $toTypes
      relationship_type: $relationship_type
      limit: $limit
      startDate: $startDate
      endDate: $endDate
      field: $field
      dateAttribute: $dateAttribute
      operation: $operation
      isTo: $isTo
    ) {
      label
      value
      entity {
        ... on BasicObject {
          entity_type
        }
        ... on AttackPattern {
          name
          description
        }
        ... on Campaign {
          name
          description
        }
        ... on CourseOfAction {
          name
          description
        }
        ... on Individual {
          name
          description
        }
        ... on Organization {
          name
          description
        }
        ... on Sector {
          name
          description
        }
        ... on System {
          name
          description
        }
        ... on Indicator {
          name
          description
        }
        ... on Infrastructure {
          name
          description
        }
        ... on IntrusionSet {
          name
          description
        }
        ... on Position {
          name
          description
        }
        ... on City {
          name
          description
        }
        ... on Country {
          name
          description
        }
        ... on Region {
          name
          description
        }
        ... on Malware {
          name
          description
        }
        ... on ThreatActor {
          name
          description
        }
        ... on Tool {
          name
          description
        }
        ... on Vulnerability {
          name
          description
        }
        ... on Incident {
          name
          description
        }
      }
    }
  }
`;

class EntityStixCoreRelationshipsPolarArea extends Component {
  renderContent() {
    const {
      t,
      entityId,
      toTypes,
      relationshipType,
      field,
      dateAttribute,
      startDate,
      endDate,
      isTo,
      theme,
      variant,
    } = this.props;
    const stixCoreRelationshipsDistributionVariables = {
      fromId: !isTo ? entityId : null,
      toId: isTo ? entityId : null,
      relationship_type: relationshipType,
      toTypes: !isTo ? toTypes : null,
      fromTypes: isTo ? toTypes : null,
      startDate: startDate || null,
      endDate: endDate || null,
      field: field || 'entity_type',
      dateAttribute,
      limit: 10,
      operation: 'count',
      isTo: isTo || false,
    };
    return (
      <QueryRenderer
        query={
          entityStixCoreRelationshipsPolarAreaStixCoreRelationshipDistributionQuery
        }
        variables={stixCoreRelationshipsDistributionVariables}
        render={({ props }) => {
          if (
            props
            && props.stixCoreRelationshipsDistribution
            && props.stixCoreRelationshipsDistribution.length > 0
          ) {
            let data = props.stixCoreRelationshipsDistribution;
            if (field === 'internal_id') {
              data = R.map(
                (n) => R.assoc(
                  'label',
                  `${
                    toTypes.length > 1
                      ? `[${t(`entity_${n.entity.entity_type}`)}] ${
                        n.entity.name
                      }`
                      : `${n.entity.name}`
                  }`,
                  n,
                ),
                props.stixCoreRelationshipsDistribution,
              );
            }
            const chartData = data.map((n) => n.value);
            const labels = data.map((n) => (field === 'entity_type' ? t(`entity_${n.label}`) : n.label));
            return (
              <Chart
                options={polarAreaChartOptions(
                  theme,
                  labels,
                  simpleNumberFormat,
                  variant === 'inEntity' ? 'left' : 'right',
                )}
                series={chartData}
                type="polarArea"
                width="100%"
                height={420}
              />
            );
          }
          if (props) {
            return (
              <div style={{ display: 'table', height: '100%', width: '100%' }}>
                <span
                  style={{
                    display: 'table-cell',
                    verticalAlign: 'middle',
                    textAlign: 'center',
                  }}
                >
                  {t('No entities of this type has been found.')}
                </span>
              </div>
            );
          }
          return (
            <div style={{ display: 'table', height: '100%', width: '100%' }}>
              <span
                style={{
                  display: 'table-cell',
                  verticalAlign: 'middle',
                  textAlign: 'center',
                }}
              >
                <CircularProgress size={40} thickness={2} />
              </span>
            </div>
          );
        }}
      />
    );
  }

  render() {
    const { t, classes, title, variant, height } = this.props;
    return (
      <div style={{ height: height || '100%' }}>
        <Typography
          variant={variant === 'inEntity' ? 'h3' : 'h4'}
          gutterBottom={true}
          style={{
            margin: variant !== 'inLine' ? '0 0 10px 0' : '-10px 0 10px -7px',
          }}
        >
          {title || t('Distribution of entities')}
        </Typography>
        {variant === 'inLine' || variant === 'inEntity' ? (
          this.renderContent()
        ) : (
          <Paper classes={{ root: classes.paper }} variant="outlined">
            {this.renderContent()}
          </Paper>
        )}
      </div>
    );
  }
}

EntityStixCoreRelationshipsPolarArea.propTypes = {
  title: PropTypes.string,
  variant: PropTypes.string,
  entityId: PropTypes.string,
  relationshipType: PropTypes.string,
  entityType: PropTypes.string,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  dateAttribute: PropTypes.string,
  field: PropTypes.string,
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
  fld: PropTypes.func,
  isTo: PropTypes.bool,
};

export default R.compose(
  inject18n,
  withTheme,
  withStyles(styles),
)(EntityStixCoreRelationshipsPolarArea);
