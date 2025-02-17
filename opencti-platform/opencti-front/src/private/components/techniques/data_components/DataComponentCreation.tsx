import React, { FunctionComponent, useState } from 'react';
import { Field, Formik } from 'formik';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import makeStyles from '@mui/styles/makeStyles';
import Fab from '@mui/material/Fab';
import { Add, Close } from '@mui/icons-material';
import * as Yup from 'yup';
import { graphql, useMutation } from 'react-relay';
import { FormikConfig, FormikHelpers } from 'formik/dist/types';
import { Dialog } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { useFormatter } from '../../../../components/i18n';
import { handleErrorInForm } from '../../../../relay/environment';
import TextField from '../../../../components/TextField';
import CreatedByField from '../../common/form/CreatedByField';
import ObjectLabelField from '../../common/form/ObjectLabelField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import MarkDownField from '../../../../components/MarkDownField';
import { Theme } from '../../../../components/Theme';
import ExternalReferencesField from '../../common/form/ExternalReferencesField';
import { insertNode } from '../../../../utils/store';
import { DataComponentsLinesPaginationQuery$variables } from './__generated__/DataComponentsLinesPaginationQuery.graphql';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import ConfidenceField from '../../common/form/ConfidenceField';
import { Option } from '../../common/form/ReferenceField';

const useStyles = makeStyles<Theme>((theme) => ({
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    position: 'fixed',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    padding: 0,
  },
  dialogActions: {
    padding: '0 17px 20px 0',
  },
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
  createButtonContextual: {
    position: 'fixed',
    bottom: 30,
    right: 30,
    zIndex: 2000,
  },
  buttons: {
    marginTop: 20,
    textAlign: 'right',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
  header: {
    backgroundColor: theme.palette.background.nav,
    padding: '20px 20px 20px 60px',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 5,
    color: 'inherit',
  },
  importButton: {
    position: 'absolute',
    top: 15,
    right: 20,
  },
  container: {
    padding: '10px 20px 20px 20px',
  },
}));

const dataComponentMutation = graphql`
  mutation DataComponentCreationMutation($input: DataComponentAddInput!) {
    dataComponentAdd(input: $input) {
      ...DataComponentLine_node
    }
  }
`;

const dataComponentValidation = (t: (message: string) => string) => Yup.object()
  .shape({
    name: Yup.string()
      .required(t('This field is required')),
    description: Yup.string()
      .min(3, t('The value is too short'))
      .max(5000, t('The value is too long'))
      .required(t('This field is required')),
    confidence: Yup.number(),
  });

interface DataComponentAddInput {
  name: string,
  description: string,
  createdBy: Option | undefined,
  objectMarking: Array<Option>,
  objectLabel: Array<Option>,
  externalReferences: Array<Option>,
  confidence: number
}

const DataComponentCreation: FunctionComponent<{
  contextual?: boolean,
  display?: boolean,
  inputValue?: string,
  paginationOptions: DataComponentsLinesPaginationQuery$variables }> = ({
  contextual,
  display,
  inputValue,
  paginationOptions,
}) => {
  const { t } = useFormatter();
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const onReset = () => handleClose();

  const initialValues: DataComponentAddInput = {
    name: inputValue || '',
    description: '',
    createdBy: '' as unknown as Option,
    objectMarking: [],
    objectLabel: [],
    externalReferences: [],
    confidence: 75,
  };

  const [commit] = useMutation(dataComponentMutation);

  const onSubmit: FormikConfig<DataComponentAddInput>['onSubmit'] = (
    values: DataComponentAddInput,
    {
      setSubmitting,
      setErrors,
      resetForm,
    }: FormikHelpers<DataComponentAddInput>,
  ) => {
    const finalValues = {
      name: values.name,
      description: values.description,
      createdBy: values.createdBy?.value,
      objectMarking: values.objectMarking.map((v) => v.value),
      objectLabel: values.objectLabel.map((v) => v.value),
      externalReferences: values.externalReferences.map((v) => v.value),
      confidence: () => parseInt(String(values.confidence), 10),
    };
    commit({
      variables: {
        input: finalValues,
      },
      updater: (store) => {
        insertNode(
          store,
          'Pagination_dataComponents',
          paginationOptions,
          'dataComponentAdd',
        );
      },
      onError: (error: Error) => {
        handleErrorInForm(error, setErrors);
        setSubmitting(false);
      },
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        handleClose();
      },
    });
  };

  const fields = (setFieldValue: (field: string, value: never, shouldValidate?: (boolean | undefined)) => void, values: DataComponentAddInput) => (
    <React.Fragment>
      <Field
        component={TextField}
        variant="standard"
        name="name"
        label={t('Name')}
        fullWidth={true}
        detectduplicate={['Data Component']}
      />
      <ConfidenceField
        name="confidence"
        label={t('Confidence')}
        fullWidth={true}
        containerStyle={fieldSpacingContainerStyle}
      />
      <Field
        component={MarkDownField}
        name="description"
        label={t('Description')}
        fullWidth={true}
        multiline={true}
        rows="4"
        style={{ marginTop: 20 }}
      />
      <CreatedByField
        name="createdBy"
        style={{
          marginTop: 20,
          width: '100%',
        }}
        setFieldValue={setFieldValue}
      />
      <ObjectLabelField
        name="objectLabel"
        style={{
          marginTop: 20,
          width: '100%',
        }}
        setFieldValue={setFieldValue}
        values={values.objectLabel}
      />
      <ObjectMarkingField
        name="objectMarking"
        style={{
          marginTop: 20,
          width: '100%',
        }}
      />
      <ExternalReferencesField
        name="externalReferences"
        style={{
          marginTop: 20,
          width: '100%',
        }}
        setFieldValue={setFieldValue}
        values={values.externalReferences}
      />
    </React.Fragment>
  );

  const button = (handleReset: () => void, isSubmitting: boolean, submitForm: () => Promise<void>) => (
    <React.Fragment>
      <Button
        variant="contained"
        onClick={handleReset}
        disabled={isSubmitting}
        classes={{ root: classes.button }}
      >
        {t('Cancel')}
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={submitForm}
        disabled={isSubmitting}
        classes={{ root: classes.button }}
      >
        {t('Create')}
      </Button>
    </React.Fragment>
  );

  const renderClassic = () => (
    <div>
      <Fab
        onClick={handleOpen}
        color="secondary"
        aria-label="Add"
        className={classes.createButton}
      >
        <Add />
      </Fab>
      <Drawer
        open={open}
        anchor="right"
        elevation={1}
        sx={{ zIndex: 1202 }}
        classes={{ paper: classes.drawerPaper }}
        onClose={handleClose}
      >
        <div className={classes.header}>
          <IconButton
            aria-label="Close"
            className={classes.closeButton}
            onClick={handleClose}
            size="large"
            color="primary"
          >
            <Close fontSize="small" color="primary" />
          </IconButton>
          <Typography variant="h6">{t('Create a data component')}</Typography>
        </div>
        <div className={classes.container}>
          <Formik<DataComponentAddInput>
            initialValues={initialValues}
            validationSchema={dataComponentValidation(t)}
            onSubmit={onSubmit}
            onReset={onReset}
          >
            {({
              submitForm,
              handleReset,
              isSubmitting,
              setFieldValue,
              values,
            }) => (
              <div style={{ margin: '20px 0 20px 0' }}>
                {fields(setFieldValue, values)}
                <div className={classes.buttons}>
                  {button(handleReset, isSubmitting, submitForm)}
                </div>
              </div>
            )}
          </Formik>
        </div>
      </Drawer>
    </div>
  );

  const renderContextual = () => (
    <div style={{ display: display ? 'block' : 'none' }}>
      <Fab
        onClick={handleOpen}
        color="secondary"
        aria-label="Add"
        className={classes.createButtonContextual}
      >
        <Add />
      </Fab>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{ elevation: 1 }}
      >
        <Formik<DataComponentAddInput>
          initialValues={initialValues}
          validationSchema={dataComponentValidation(t)}
          onSubmit={onSubmit}
          onReset={onReset}
        >
          {({
            submitForm,
            handleReset,
            isSubmitting,
            setFieldValue,
            values,
          }) => (
            <div>
              <DialogTitle>{t('Create a data component')}</DialogTitle>
              <DialogContent>
                {fields(setFieldValue, values)}
              </DialogContent>
              <DialogActions classes={{ root: classes.dialogActions }}>
                {button(handleReset, isSubmitting, submitForm)}
              </DialogActions>
            </div>
          )}
        </Formik>
      </Dialog>
    </div>
  );

  if (contextual) {
    return renderContextual();
  }
  return renderClassic();
};

export default DataComponentCreation;
