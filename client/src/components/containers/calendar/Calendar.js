import React, { Component } from 'react';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import { Grid, Header, Label, Icon, Container, Message } from "semantic-ui-react";
import { CalendarPopup } from 'components/containers/popup';
import CalendarCustomToolbar from "./CalendarCustomToolbar";
import { ReactComponent as PlaceholderImg } from "assets/calendarPlaceholder.svg";
import { TherapyType, TherapyTypeColour } from "enums";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import "./Calendar.css";

moment.locale('en');
const localizer = BigCalendar.momentLocalizer(moment);
const appointmentStartTime = moment().hours(8).minute(0).second(0).toDate();
const appointmentEndTime = moment().hours(17).minute(0).second(0).toDate();

class Calendar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isCalendarPopupOpen: false,
      selectedEvent: {},
    };

    this.handleErrorDismiss = this.handleErrorDismiss.bind(this);
    this.toggleAddModal = this.toggleAddModal.bind(this);
    this.parseEventsToCalendarEvents = this.parseEventsToCalendarEvents.bind(this);
  }

  // TODO: requires refactor when database is connected
  toggleAddModal(event, isUpdateAppointment) {
    let selectedEvent = {};
    if (event != null) {
      isUpdateAppointment = isUpdateAppointment || false;
      selectedEvent = Object.assign(event, { isUpdateAppointment });
    }

    this.setState({
      selectedEvent: selectedEvent,
      isCalendarPopupOpen: !this.state.isCalendarPopupOpen,
    });
  };

  parseEventsToCalendarEvents(events) {
    const calendarEvents = events.map(event => {
      return Object.assign(
        { ...event },
        this._generateTitle(event),
        this._generateStartAndEndTime(event)
      );
    });
    return calendarEvents;
  }

  /**
   * Generates Title using event's staff and patient
   * @param  {User} options.patient
   * @param  {User} options.staff
   * @return {Object} [if patient and staff exist return {title:...} else returns {}]
   */
  _generateTitle({ patient, staff, type_of_therapy }) {
    if (patient && staff) {
      const title = `Patient: ${patient.first_name} ${patient.last_name},
      Staff: ${staff.first_name} ${staff.last_name},
      Therapy Type: ${type_of_therapy}`;
      return { title };
    }
    return {};
  }

  /**
   * Using events start date, time and end date and time generate a start and end time.
   * This is used for BigCalendar Compatibility.
   * @param  {Date String} options.start_date [Date Object Stringified. It is used for both start and end time]
   * @param  {Time String} options.start_time ["HH:mm:ss"]
   * @param  {Time String} options.end_time   ["HH:mm:ss"]
   * @return {Object} [If at least one parameter is null then return an object otherwise returns {start:..., end:...}]
   */
  _generateStartAndEndTime({ start_date, start_time, end_time }) {
    if (!start_date || !start_time || !end_time) return {};
    const splitStartTime = start_time.split(":");
    const splitEndTime = end_time.split(":");
    const start = moment(start_date).hours(splitStartTime[0]).minutes(splitStartTime[1]).toDate();
    const end = moment(start_date).hours(splitEndTime[0]).minutes(splitEndTime[1]).toDate();
    return { start, end };
  }

  /**
   * Give back the proper icon name according to selected user type.
   * @param {String} t
   * @return {String} Name of appropriate icon.
   * TODO: this is a code smell, could be better if we had universal enums to store all these.
   */
  _getUserTypeIconName(t) {
    return t === "Patient" ? "user" : (t === "Staff" ? "user md" : null);
  }

  _isEmptyUserObj(user) {
    return Object.keys(user).length === 0 && user.constructor === Object
  }

  _getSelectedUserName(user) {
    return `${user.first_name} ${user.last_name}`;
  }

  handleErrorDismiss() {
    this.props.closeErrorMessage();
  }

  renderErrorMessage(errorMessage) {
    return (
      <Message
        negative
        onDismiss={this.handleErrorDismiss}>
        <Message.Header>There was some errors with your submission</Message.Header>
        <p>{errorMessage.message}</p>
      </Message>
    )
  }

  /**
   * This function is used by big calendar react to style individual events
   * @param  {Object}  event      [Object that contains information about an appointment]
   * @param  {Date}  start        [Date object that includes start time of an appointment]
   * @param  {Date}  end          [Date object that includes end time of an appointment]
   * @param  {Boolean} isSelected [description]
   * @return {Object}             [CSS style object]
   */
  eventStyleGetter(event, start, end, isSelected) {
    const { type_of_therapy } = event;
    const fontColor = "#fff";
    let backgroundColor = TherapyTypeColour.DEFAULT;

    if (type_of_therapy) {
      // NOTE: No need for iterating through keys if computed property names can be done in enums.js
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#Computed_property_names
      const typeKey = Object.keys(TherapyType).find(key => TherapyType[key] === type_of_therapy);
      backgroundColor = TherapyTypeColour[typeKey];
    }

    const style = {
      backgroundColor: backgroundColor,
      // color: fontColor,
      border: `1px solid ${backgroundColor}`,
      borderRadius: '5px'
    };

    return { style: style };
  }

  render() {
    const today = moment().toDate();
    const { isCalendarPopupOpen } = this.state;
    const { errorMessage, events, selectedUser, patientsStaffs, currentUser } = this.props;

    if (this._isEmptyUserObj(selectedUser)) {
      return (
        <Grid.Column className="calendarAppointmentContainer">
          <Container className="calendarPlaceholder">
            <PlaceholderImg className="placeholderImage" />
            <p id="placeholderText">
              Click the "Select View" button to choose either a patient or staff.
            </p>
          </Container>
        </Grid.Column>
      );
    }
    // If selected user exists with expected fields, show calendar.
    return (
      <Grid.Column className="calendarAppointmentContainer" >
        {errorMessage.status ? this.renderErrorMessage(errorMessage) : null}
        <Grid.Row>
          <Header className="calendarUser userName"> {this._getSelectedUserName(selectedUser)} </Header>
        </Grid.Row>

        <Grid.Row className="calendarUser userTypeRow non-printable">
          <Label basic color='black'>
            <Icon name={this._getUserTypeIconName(selectedUser.type)} /> {selectedUser.type}
          </Label>
        </Grid.Row>

        <Grid.Row>
          <BigCalendar
            className="appointmentCalendar"
            selectable
            popup={true}
            localizer={localizer}
            events={this.parseEventsToCalendarEvents(events)}
            defaultView={BigCalendar.Views.WORK_WEEK}
            defaultDate={today}
            views={[BigCalendar.Views.DAY, BigCalendar.Views.WORK_WEEK, BigCalendar.Views.MONTH]}
            min={appointmentStartTime}
            max={appointmentEndTime}
            onSelectEvent={(e) => this.toggleAddModal(e, true)}
            onSelectSlot={(e) => this.toggleAddModal(e, false)}
            components={{ toolbar: CalendarCustomToolbar }}
            eventPropGetter={this.eventStyleGetter}
          />
        </Grid.Row>

        {currentUser && currentUser.type === "Administrator" && isCalendarPopupOpen ?
          <CalendarPopup
            isOpen={isCalendarPopupOpen}
            onClose={this.toggleAddModal}
            event={this.state.selectedEvent}
            patientsStaffs={patientsStaffs}
            selectedUser={selectedUser}
          />
          : null
        }
      </Grid.Column>
    );
  }
}


export default Calendar;