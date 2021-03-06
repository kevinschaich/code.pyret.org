import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import GoogleAPI from './GoogleAPI.js';
import '../../css/dashboard/index.css';

import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';
import { Layout, Header, Drawer, Navigation, Content, Button, HeaderRow, HeaderTabs, Tab, Snackbar } from 'react-mdl';

import ClassList from './ClassList';
import StudentList from './StudentList';
import AssignmentList from './AssignmentList';

const ROSTER_TAB = 0;
const ASSIGNMENTS_TAB = 1;

class TeacherDashboard extends Component {
  constructor() {
    super();

    this.state = {
      signedIn: false,
      classes: {},
      activeTab: ROSTER_TAB,
      activeClassId: false,
      activeClass: '',
      studentsInClass: [],
      assignmentsInClass: [],
      studentSpinnerActive: true,
      classSpinnerActive: true,
      assignmentSpinnerActive: true,
      isSnackbarActive: false,
      snackbarText: ''
    };

    this.api = new GoogleAPI();
    this.api.load().then(() => {
      this.handlePageLoad();
    }).catch(e => {
      console.log(e);
      this.props.snackBar('Could not load Google API (possibly network error). Try again in a few moments.');
    });
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.studentsInClass != prevState.studentsInClass) {
      this.setState({studentSpinnerActive: false});
    }
    if (this.state.classes != prevState.classes) {
      this.setState({classSpinnerActive: false});
    }
    if (this.state.assignmentsInClass != prevState.assignmentsInClass) {
      this.setState({assignmentSpinnerActive: false});
    }
  }

  setSnackBarMessage = (message) => {
    this.setState({
      isSnackbarActive: true,
      snackbarText: message
    });
  }

  handleTimeoutSnackbar = () =>{
    this.setState({ isSnackbarActive: false });
  }

  handleClickActionSnackbar = () => {
    this.setState({ isSnackbarActive: false });
  }

  handleSignInClick = () => {
    this.api.signIn().then(() => {
      this.handlePageLoad();
    }).catch(e => {
      console.log(e);
      this.props.snackBar('Could not sign in (possibly network error). Try again in a few moments.');
    });
  }

  handleSignOutClick = () => {
    this.setState({signedIn: false});
    window.location.replace('/logout');
  }

  handlePageLoad = () => {
    this.setState({signedIn: true});
    this.api.initializePyretData().then(() => {
      this.refreshState();
    }).catch(e => {
      console.log(e);
      this.props.snackBar('Could not initialize Pyret folder on Google Drive (possibly network error). Try again in a few moments.');
    });
  }

  refreshState = () => {
    this.api.getAllClasses().then((resp) => {
      const classes = resp;
      this.setState({
        classes: classes,
        activeClassId: 'class' + Object.keys(classes)[0] || '',
        activeClass: Object.keys(classes)[0] || false
      }, () => {
        this.refreshInnerState();
      });
    }).catch(e => {
      console.log(e);
      this.props.snackBar('Could not retrieve classes (possibly network error). Try again in a few moments.');
    });
  }

  refreshInnerState = () => {
    if (this.state.activeClass) {
      this.api.getStudentsInClass(this.state.activeClass).then(resp => {
        this.setState({studentsInClass: resp});
      }).catch(e => {
        console.log(e);
        this.props.snackBar('Could not retrieve roster (possibly network error). Try again in a few moments.');
      });
      this.api.getAssignmentsInClass(this.state.activeClass).then(resp => {
        this.setState({assignmentsInClass: resp});
      }).catch(e => {
        console.log(e);
        this.props.snackBar('Could not retrieve assignments (possibly network error). Try again in a few moments.');
      });
    }
  }

  handleClickClass = (event) => {
    const activeClass = event.currentTarget.id.match(/\d/g).join("");
    this.setState({studentSpinnerActive: true, activeClassId: event.currentTarget.id, activeClass: activeClass}, () => {
      this.refreshInnerState();
    });
  }

  render = () => {
    const getContentForTab = () => {
      const activeTab = this.state.activeTab;
      // Roster
      if (activeTab == ROSTER_TAB) {
        return (
          <StudentList
            updating={this.state.studentSpinnerActive}
            students={this.state.studentsInClass}
            activeClass={this.state.activeClass}
            api={this.api}
            refreshParent={this.refreshState}
            snackBar={this.setSnackBarMessage}
          />
        );
      }
      // Assignments
      if (activeTab == ASSIGNMENTS_TAB) {
        return (
          <AssignmentList
            updating={this.state.assignmentSpinnerActive}
            assignments={this.state.assignmentsInClass}
            api={this.api}
            snackBar={this.setSnackBarMessage}
            activeClass={this.state.activeClass}
            refreshParent={this.refreshState}
          />
        );
      }
    };

    return (
      <Layout fixedHeader fixedDrawer>

        <Header>
          <HeaderRow title="Pyret - Teacher Dashboard">
            <Navigation>
              <Button
                raised ripple style={{'lineHeight': '33px'}}
                onClick={this.state.signedIn ? this.handleSignOutClick : this.handleSignInClick}
              >
                {this.state.signedIn ? 'Sign Out' : 'Sign In'}
              </Button>
            </Navigation>
          </HeaderRow>

           <HeaderTabs ripple activeTab={this.state.activeTab} onChange={(tabId) => this.setState({ activeTab: tabId })}>
             <Tab>Roster</Tab>
             <Tab>Assignments</Tab>
           </HeaderTabs>
        </Header>

        <Drawer title="Classes">
          <Navigation>
            <ClassList
              updating={this.state.classSpinnerActive}
              classes={Object.values(this.state.classes)}
              activeClassId={this.state.activeClassId}
              handleClickClass={this.handleClickClass}
              api={this.api}
              refreshParent={this.refreshState}
              snackBar={this.setSnackBarMessage}
            />
          </Navigation>
        </Drawer>

        <Content>
          <div className="page-content">
            {getContentForTab()}
          </div>
          <Snackbar
            active={this.state.isSnackbarActive}
            onClick={this.handleClickActionSnackbar}
            onTimeout={this.handleTimeoutSnackbar}
            action="OK">{this.state.snackbarText}
          </Snackbar>
        </Content>

      </Layout>
    );
  }
}

ReactDOM.render(
  <TeacherDashboard />,
  document.getElementById('root')
);
