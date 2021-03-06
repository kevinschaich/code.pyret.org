import React, { Component } from 'react';
import Assignment from './Assignment.js';
import { Button, Textfield, Card, CardTitle, CardText, Spinner } from 'react-mdl';

class AssignmentList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      addingAssignment: false,
      newAssignmentName: '',
      selectedTemplateFileID: false,
      selectedTemplateFileName: false,
      activeClass: props.activeClass
    };
  }

  handleClickAddAssignment = () => {
    this.setState({addingAssignment: ! this.state.addingAssignment});
  }

  handleChange = (event) => {
    this.setState({[event.target.id]: event.target.value});
  }

  handleSubmitAddAssignment = (event) => {
    event.preventDefault();
    this.props.snackBar('Assignment Added. Please allow a few seconds for changes to appear.');
    this.setState({addingAssignment: false});
    this.props.api.createAndDistributeAssignment(this.state.activeClass, this.state.newAssignmentName.trim(), this.state.selectedTemplateFileID).then((resp) => {
      this.setState({
        newAssignmentName: '',
        selectedTemplateFileID: false,
        selectedTemplateFileName: false
      });
      this.props.refreshParent();
    }).catch(e => {
      console.log(e);
      this.props.snackBar('Could not create assignment (possibly network error). Try again in a few moments.');
    });
  }

  handleClickSelectTemplateFile = (event) => {
    event.preventDefault();
    this.props.api.createPicker((data) => {
      if (data.action === window.google.picker.Action.PICKED) {
        var fileId = data.docs[0].id;
        var fileName = data.docs[0].name;
        this.setState({
          selectedTemplateFileID: fileId,
          selectedTemplateFileName: fileName
        });
        window.picker.setVisible(false);
      }
    });
  }

  render = () => {
    const assignments = this.props.assignments.map(c => {
      return <Assignment snackBar={this.props.snackBar} key={c.id} details={c} api={this.props.api} refreshParent={this.props.refreshParent}/>;
    });
    return (
      <div>
        <Spinner className={this.props.updating ? '' : 'hidden'} singleColor style={{'margin': '16px 40px'}}/>
        <div className={this.props.updating ? 'hidden' : ''}>
          {assignments}
          <Button style={{'margin': '8pt 8pt 16pt 8pt', 'display': 'block'}} raised ripple colored
            onClick={this.handleClickAddAssignment}
          >
            {this.state.addingAssignment ? 'Cancel' : 'Add Assignment'}
          </Button>
          <Card
            className={this.state.addingAssignment ? '': 'hidden'}
            onClick={this.handleFileClick}
            shadow={1}
            style={{
              'display': 'block',
              'margin': '8pt',
              'background': '#f4f6ff',
              'minHeight': '0px',
              'verticalAlign': 'middle'
            }}
          >
            <CardTitle>New Assignment</CardTitle>
            <CardText>
              <form onSubmit={this.handleSubmitAddAssignment}>
                <Textfield
                  id='newAssignmentName'
                  value={this.state.newAssignmentName}
                  onChange={this.handleChange}
                  label="Assignment Name"
                  floatingLabel
                  style={{width: '100%'}}
                />
                <div style={{'margin': '0 0 32pt 0'}}>
                  <Textfield
                    label={this.state.selectedTemplateFileID ? 'File Name' : 'No template file currently selected'}
                    value={this.state.selectedTemplateFileID ? (this.state.selectedTemplateFileName || '[Untitled]') : ''}
                    floatingLabel
                    style={{width: '100%'}}
                    disabled
                  />
                  <Button raised ripple colored onClick={this.handleClickSelectTemplateFile}>
                    {this.state.selectedTemplateFileID ? 'Change Template File' : 'Select Template File'}
                  </Button>
                </div>
                <Button type='submit' style={{'margin': '8pt 0'}} raised ripple colored>Create New Assignment</Button>
              </form>
            </CardText>
          </Card>
        </div>
      </div>
    );
  }
}

export default AssignmentList;
