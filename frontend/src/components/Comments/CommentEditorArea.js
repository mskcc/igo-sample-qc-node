import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import CommentEditor from './CommentEditor';
import CovidEditor from './CovidEditor';
import RecipientList from './RecipientList';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'grid',
    width: '100%',
    gridTemplateAreas: "'recipients' 'editor' ",
    gridRowGap: '2em',
    alignItems: 'center',
    justifyItems: 'center',
    margin: theme.spacing(3, 4),
  },
  editor: {
    gridArea: 'editor',
  },
  recipients: {
    width: '100%',
    gridArea: 'recipients',
    display: 'grid',
    alignItems: 'start',
    justifyItems: 'start',
    borderBottom: '2px solid lightgray',
  },
}));

export default function CommentEditorArea(props) {
  const classes = useStyles();
  const [values, setValues] = React.useState({ recipientsBeingEdited: false });

  const handleInitialComment = (comment, reports) => {
    props.handleInitialComment(comment, reports);
  };

  const handleEdit = () => {
    setValues({
      ...values,
      recipientsBeingEdited: !values.recipientsBeingEdited,
    });
  };

  return (
    <div className={classes.container}>
      <div className={classes.recipients}>
        <RecipientList
          handleSubmit={props.handleRecipientSubmit}
          handleEdit={handleEdit}
          recipients={props.recipients}
        />
      </div>
      {props.currentReportShown.includes('COVID') ? (
        <CovidEditor
          recipe={props.recipe}
          currentReportShown={props.currentReportShown}
          request={props.request}
          tables={props.tables}
          comments={props.comments}
          recipientsBeingEdited={values.recipientsBeingEdited}
          handleInitialComment={handleInitialComment}
        />
      ) : (
        <CommentEditor
          recipe={props.recipe}
          currentReportShown={props.currentReportShown}
          request={props.request}
          recipients={props.recipients}
          tables={props.tables}
          comments={props.comments}
          recipientsBeingEdited={values.recipientsBeingEdited}
          handleInitialComment={handleInitialComment}
        />
      )}
    </div>
  );
}
