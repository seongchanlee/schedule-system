import React, {Component} from 'react';
// import {connect} from 'react-redux';
import { isEmpty } from "lodash";
import { Grid, Button, Icon } from "semantic-ui-react";
import { PatientStaffSearch } from 'components/containers/popup';
import { CalendarPopup } from 'components/containers/popup';
import moment from 'moment';
import "./CalendarSideBar.css";

const event = {
  "type_of_therapy": "",
  "start": moment().hours(0).minutes(0).seconds(0).toDate(),
  "end": moment().hours(0).minutes(0).seconds(0).toDate(),
  "patient": {},
  "staff": {},
  isUpdateAppointment: false
}

class CalendarSideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isCalendarPopupOpen: false,
      isSearchOpen: false
    }

    this.toggleSearchModal = this.toggleSearchModal.bind(this);
    this.toggleCalendarModal = this.toggleCalendarModal.bind(this);
  }

  toggleSearchModal(event) {
    this.setState({
      isSearchOpen: !this.state.isSearchOpen,
    });
  };

  toggleCalendarModal(event) {
    this.setState({ isCalendarPopupOpen: !this.state.isCalendarPopupOpen });
  }

  handlePrintCalendar() {

  }

  render() {
    const { isCalendarPopupOpen, isSearchOpen } = this.state;
    const { selectedUser, patientsStaffs, currentUser} = this.props;
    return(
      <Grid.Column
      className="non-printable calendarSideBarContainer"
      widescreen={2}
      largeScreen={2}
      computer={3}
      tablet={4}
      mobile={4}
      textAlign="center">
        { currentUser && currentUser.type === "Administrator" ?
          <Grid.Row className="calendarSideBarRow">
            <Button
              className="calendarSideBarButton"
              primary
              size='medium'
              icon labelPosition="right"
              onClick={ this.toggleSearchModal }>
              Select View
              <Icon name='users' />
            </Button>
          </Grid.Row>
          : null
        }
        { currentUser && currentUser.type === "Administrator" ?
          <Grid.Row className="calendarSideBarRow">
            <Button
              className="calendarSideBarButton"
              primary
              size='medium'
              icon labelPosition="right"
              onClick={ this.toggleCalendarModal }>
              Create
              <Icon name='plus' />
            </Button>
          </Grid.Row>
          : null
        }
        <Grid.Row className="calendarSideBarRow">
          <Button
            className="calendarSideBarButton"
            primary
            size='medium'
            disabled={ isEmpty(selectedUser) }
            icon labelPosition="right"
            // TODO: TD-70 implement our onw print functionality
            onClick= {window.print.bind(window)}>
            Print
            <Icon name='print' />
          </Button>
        </Grid.Row>

        { currentUser && currentUser.type === "Administrator" && isSearchOpen ?
          <PatientStaffSearch
            isOpen={ isSearchOpen }
            onClose={ this.toggleSearchModal }
            patientsStaffs={ patientsStaffs }
          />
          : null
        }
        { currentUser && currentUser.type === "Administrator" && isCalendarPopupOpen ?
          <CalendarPopup
            isSidebarCreate={ true }
            isOpen={ isCalendarPopupOpen }
            onClose={ this.toggleCalendarModal }
            event={ event }
            patientsStaffs={ patientsStaffs }
            selectedUser={ selectedUser }
          />
          : null
        }
      </Grid.Column>
    )
  }
}

export default CalendarSideBar;