import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import GoogleAPI from './GoogleAPI.js';
import {CLIENT_ID, FILE_EXT, APP_NAME, API_KEY} from './config.js';
import '../../css/dashboard/index.css';

import File from './File';
import ClassList from './ClassList';
import Class from './Class';
import Student from './Student';

class TeacherDashboard extends Component {
  constructor() {
    super();

    this.state = {
      signedIn: false,
      classes: [],
      activeTab: 'roster',
      newFileName: ''
    };

    this.api = new GoogleAPI();
    this.api.load().then((resp) => {
      this.handlePageLoad();
    });
  }

  handleSignInClick = (event) => {
    this.api.signIn().then((resp) => {
      this.handlePageLoad();
    });
  }

  handleSignOutClick = (event) => {
    this.setState({signedIn: false});
    window.location.replace('/logout');
  }

  handlePageLoad = () => {
    this.setState({signedIn: true});
    this.api.initializePyretData().then(() => {
      this.refreshState();
    });
  }

  refreshState = () => {
    this.api.getAllClasses().then((resp) => {
      this.setState({classes: Object.values(resp)});
    });
  }

  handleTabClick = (event) => {
    this.setState({activeTab: event.target.id});
  }

  render = () => {
    const tab = this.state.activeTab;

    return (
      <div className='component-wrap'>
        <div id='header' className=''>
          <div className='container'>
            <h1 className='logo-text left'>{APP_NAME} – Teacher Dashboard</h1>
            <div className='button-wrapper right'>
              <button className={'auth-button ' + (this.state.signedIn ? 'hidden' : '')} onClick={this.handleSignInClick} id='signin-button' >Sign in</button>
            </div>
            <div className='button-wrapper right'>
              <button className={'auth-button ' + (this.state.signedIn ? '' : 'hidden')} onClick={this.handleSignOutClick} id='signout-button' >Sign out</button>
            </div>
          </div>
        </div>
        <div id='loading-spinner' className={this.state.signedIn ? 'hidden' : ''}>
          <h1>Waiting for login...</h1>
          <i className='fa fa-circle-o-notch fast-spin fa-3x fa-fw'></i>
        </div>
        <div id={'sidebar' + (this.state.signedIn ? '' : 'hidden')}>
          <ClassList classes={this.state.classes} api={this.api} refreshParent={this.refreshState}/>
        </div>
        <div id='modal' id='modal' className={'modal-wrap modal-teacher container ' + (this.state.signedIn ? '' : 'hidden')}>
          <div id='modal-tabs' className='cf'>
            <h2 id='roster' className={'tab floatable left ' + ((tab === 'roster') ? 'active' : '')} onClick={this.handleTabClick}>Roster</h2>
            <h2 id='assignments' className={'tab floatable left ' + ((tab === 'assignments') ? 'active' : '')} onClick={this.handleTabClick}>Assignments</h2>
          </div>
          <div id='modal-body' className={'modal-body ' + ((tab === 'roster') ? '' : 'hidden')}>
            <Student details={{firstName: 'John', lastName: 'Doe', email: 'john@cornell.edu'}} api={this.api}/>
            <Student details={{firstName: 'Jane', lastName: 'Doe', email: 'jane@cornell.edu'}} api={this.api}/>
            <Student details={{firstName: 'Timmy', lastName: 'Turner', email: 'timmy@cornell.edu'}} api={this.api}/>
          </div>
          <div id='modal-body' className={'modal-body ' + ((tab === 'assignments') ? '' : 'hidden')}>
            assignments!
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <TeacherDashboard />,
  document.getElementById('root')
);