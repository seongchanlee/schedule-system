import React, {Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { isEqual } from 'lodash';
import { Container, Button, Modal, Form, Select, Confirm, Label } from 'semantic-ui-react';
import { DateInput, TimeInput } from 'semantic-ui-calendar-react';
import { CalendarAction } from 'actions';
import { SearchInput } from 'components/containers/search';
import * as moment from 'moment';
import './CalendarPopup.css';
moment.locale('en');

// constants can be moved to constants dir
const REPEAT_CONST = [
  { key: 'Never', text: 'Never', value: 'Never' },
  { key: 'Daily', text: 'Daily', value: 'Daily' },
  { key: 'Weekly', text: 'Weekly', value: 'Weekly' },
  { key: 'Monthly', text: 'Monthly', value: 'Monthly' }
];

const THERAPY_TYPE_CONST = [
  { key: "PT", text: "PT", value: "PT" },
  { key: "PTRA", text: "PTRA", value: "PTRA" },
  { key: "OT", text: "OT", value: "OT" },
  { key: "OTRA", text: "OTRA", value: "OTRA" },
  { key: "SLP", text: "SLP", value: "SLP" },
  { key: "SLPA", text: "SLPA", value: "SLPA" }
];

const USER_TYPE = {
  patient: "Patient",
  staff: "Staff"
};

const POPUP_STATE_CONST = {
  patient: "patient",
  staff: "staff",
  start: "start",
  end: "end",
  repeat: "repeat"
};

class CalendarPopup extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    const { event, selectedUser, isSidebarCreate } = props;
    const { start, end, isUpdateAppointment, id, staff, patient, is_attend, type_of_therapy } = event;
    this.state = {
      id: id || -1,
      selectedUser,
      patient: selectedUser && selectedUser.type === "Patient" ? selectedUser : (patient || {}),
      staff: selectedUser && selectedUser.type === "Staff" ? selectedUser : (staff || {}),
      start: start,
      end: end,
      repeat: REPEAT_CONST[0].key,
      therapyType: type_of_therapy || "",
      isUpdateAppointment: isUpdateAppointment,
      isAttend: isUpdateAppointment ? !!is_attend : true,
      // non submission fields
      showCancellationPopup: false,
      // validation fields
      startTimeError: isSidebarCreate ? isSidebarCreate : false,
      endTimeError: isSidebarCreate ? isSidebarCreate : false,
    };

    // Handler functions
    this.handleSearchInputSelect = this.handleSearchInputSelect.bind(this);
    this.handleSearchResult = this.handleSearchResult.bind(this);
    this.handleCancellationPopup = this.handleCancellationPopup.bind(this);
    this._handleInputChange = this._handleInputChange.bind(this);
    this._handleTimeChange = this._handleTimeChange.bind(this);
    this._handleDateChange = this._handleDateChange.bind(this);
    this._handleAttendanceChange = this._handleAttendanceChange.bind(this);

    // Currently not in use leaving for warranty period.
    // this._handleTherapyTypeChange = this._handleTherapyTypeChange.bind(this);

    // Helper functions
    this._updateTimeToCorrectDate = this._updateTimeToCorrectDate.bind(this);
    this._validateTime = this._validateTime.bind(this);
    this._getAppropriateUser = this._getAppropriateUser.bind(this);
    this._isButtonDisabled = this._isButtonDisabled.bind(this);

    // API end point functions
    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /**
   * Function that is passed to SearchInput children that updates this state
   * @param  {User Obj} selectedUser [User Object that is passed when selected]
   * @param  {String} type         [Enum: "Staff", "Patient"]
   */
  handleSearchInputSelect(selectedUser, type) {
    if (type === USER_TYPE.staff) {
      this.setState({ staff: selectedUser });
    } else if (type === USER_TYPE.patient) {
      this.setState({ patient: selectedUser });
    }
  }

  handleSearchResult(key, result) {
    this.setState({ [key]: result });
  }

  _handleInputChange(event, key) {
    const value = event.target && event.target.value;
    this.setState({ [key]: value });
  }

  // TODO: this is for repeat, implement or remove after MVP
  // _handleSelectChange(event, { value }) {
  //   this.setState({ repeat: value });
  // }

  _handleDateChange(event, { value }) {
    const chosenDate = moment(value, "MM-DD-YYYY");
    const updatedStartTime = this._updateTimeToCorrectDate(POPUP_STATE_CONST.start, chosenDate);
    const updatedEndTime = this._updateTimeToCorrectDate(POPUP_STATE_CONST.end, chosenDate);

    if (!updatedStartTime.isBefore(updatedEndTime)) {
      this.setState({
        startTimeError: true,
        endTimeError: true
      });
    }

    this.setState({
      start: updatedStartTime,
      end: updatedEndTime
    });
  }

  /**
   * Converts "hh:mm AM/PM" to 24 hour format
   * @param  {String} value [time in 12 hour format with AM/PM ex: "2:00 PM"]
   * @return {Object}       [properties hours: int, minutes: int]
   */
  _parseToTwentyFourHourFormat(value) {
    const timeAMPM = value.split(" ");
    const hhmm = timeAMPM[0].split(":");
    if (timeAMPM[1] === "PM") {
      return {
        hours: (parseInt(hhmm[0]) + 12),
        minutes: parseInt(hhmm[1])
      }
    } else if(timeAMPM[1] === "AM") {
      return {
        hours: (parseInt(hhmm[0])),
        minutes: parseInt(hhmm[1])
      }
    }
  }

  _handleTimeChange(event, key, { value }) {
    const hhmm = this._parseToTwentyFourHourFormat(value);
    const appointmentTime = moment(this.state[key])
      .hours(hhmm.hours)
      .minutes(hhmm.minutes)
      .seconds(0);

    const timeError = this._validateTime(key, appointmentTime);
    if (timeError) {
      this.setState({
        [key]: appointmentTime.toDate(),
        startTimeError: true,
        endTimeError: true
      });
    } else {
      this.setState({
        [key]: appointmentTime.toDate(),
        startTimeError: false,
        endTimeError: false
      });
    }
  }

  _handleAttendanceChange() {
    this.setState({ isAttend: !this.state.isAttend });
  }



  /**
   * @param  {[String]} key [Will be either "start" or "end"]
   * @param  {[Moment Obj]} chosenDate [Moment obj with date format MM-DD-YYYY]
   * @return {[Date]}
   */
  _updateTimeToCorrectDate(key ,chosenDate) {
    if (key === POPUP_STATE_CONST.start || key === POPUP_STATE_CONST.end) {
      const prevMoment = moment(this.state[key]);
      if (!prevMoment.isValid()) {
        return chosenDate;
      }
      return moment(this.state[key])
        .year(chosenDate.year())
        .month(chosenDate.month())
        .date(chosenDate.date());
    }
    // default error handling, may customize when necessary.
    return new Date();
  }

  /**
   * @param  {[String]} key [Will be either "start" or "end"]
   * @param  {[Date]} time [end users chosen time wrapped in Date() object]
   * @return {[boolean]} true if startTime doesn't conflict with endTime
   */
  _validateTime(key, time) {
    const isKeyStart = key === POPUP_STATE_CONST.start;
    const startTime = isKeyStart ? time : moment(this.state.start);
    const endTime = isKeyStart ? moment(this.state.end) : time;
    return !startTime.isBefore(endTime);
  }

  /**
   * Returns appropriate user (staff or patient) depending on selected user and form type
   * @param  {[String]} formType [Enum String "Patient", "Staff"]
   * @return {[User Obj]}  [if it is an update return user obj depending on form type. Otherwise
   *                       return based on selectedUser's type]
   */
   _getAppropriateUser(formType) {
    //TODO: "Patient" and "Staff" move to Constant.
    const {isUpdateAppointment, staff, patient, selectedUser} = this.state;
    if (isUpdateAppointment) {
      return formType === USER_TYPE.patient ? patient : staff;
    }

    return selectedUser.type === formType ? selectedUser : null;
  }

  /**
   * This function is only used to CREATE and UPDATE appointments excluding cancel
   */
  onSubmit(event) {
    event.preventDefault();
    const copiedState = Object.assign(
      {...this.state},
      { start: moment(this.state.start).format("YYYY-MM-DDTHH:mm") },
      { end: moment(this.state.end).format("YYYY-MM-DDTHH:mm") },
      { isCancelled: false }
    );
    if (this.state.isUpdateAppointment) {
      this.props.updateAppointment(copiedState);
    } else {
      this.props.createAppointment(copiedState);
    }
    this.props.onClose();
  }

  /**
   * This function is only used to CANCEL (soft Delete) exisiting appointments
   */
  onCancel(event) {
    const { isUpdateAppointment, id } = this.state;
    if (!isUpdateAppointment) return;
    event.preventDefault();

    this.setState({ showCancellationPopup: false });
    this.props.deleteAppointment(id);
    this.props.onClose();
  }

  _renderModalHeader() {
    const { isUpdateAppointment } = this.state;
    return (
      <Modal.Header>
        { isUpdateAppointment ? "Update Appointment" : "New Appointment" }
      </Modal.Header>
    );
  }

  /**
   * Will disable button if necessary fields are not filled out. If selected date is before today it will allow
   * creation and update, but will highlight the date input to notify user.
   * @return {Boolean}
   */
  _isButtonDisabled() {
    const { patient, staff, start, end, startTimeError, endTimeError } = this.state;
    const mStart = moment(start) , mEnd = moment(end);
    return !mStart.isValid() || !mEnd.isValid() || !mStart.isBefore(mEnd)
      || isEqual(patient, {}) || isEqual(staff, {}) ||
      startTimeError || endTimeError;
  }

  handleCancellationPopup() {
    this.setState({ showCancellationPopup: !this.state.showCancellationPopup });
  }

  _renderModalActionButton() {
    const { isUpdateAppointment } = this.state;
    return(
      <div>
        { isUpdateAppointment ?
          <Button color='red' onClick={ this.handleCancellationPopup }>
            Cancel Appointment
          </Button> :
          null
        }
        <Button
          primary
          disabled={ this._isButtonDisabled() }
          content={ isUpdateAppointment ? "Update" : "Create"}
          onClick={ this.onSubmit }
        />
        <Confirm
          header="Cancel Appointment Confirmation"
          content="Are you sure you want to cancel this appointment?"
          confirmButton="Yes"
          cancelButton="No"
          open={ this.state.showCancellationPopup }
          onCancel={ this.handleCancellationPopup }
          onConfirm={ this.onCancel }
        />
      </div>
    );
  }

  _renderPatientForm() {
    const { patient, selectedUser } = this.state;
    const patients = this.props.patientsStaffs;
    return(
      <Form.Field error={ (isEqual(patient, {}) || !patient) }>
        <label>Patient *</label>
        <SearchInput
          formType="Patient"
          results={patients}
          handleSearchInputSelect={this.handleSearchInputSelect}
          selectedUser={this._getAppropriateUser(USER_TYPE.patient)}
          isSelectedUser={ selectedUser && selectedUser.type === USER_TYPE.patient }
        />
        {(isEqual(patient, {}) || !patient) ?
          <Label basic color = 'red' pointing> Please select a patient. </Label>
          : null
        }
      </Form.Field>
    );
  }

  _renderStaffForm() {
    const { staff, selectedUser } = this.state;
    const staffs = this.props.patientsStaffs;
    return(
      <Form.Field error={ (isEqual(staff, {}) || !staff) }>
        <label>Staff *</label>
        <SearchInput
          formType="Staff"
          results={staffs}
          handleSearchInputSelect={this.handleSearchInputSelect}
          selectedUser={this._getAppropriateUser(USER_TYPE.staff)}
          isSelectedUser={ selectedUser && selectedUser.type === USER_TYPE.staff }
        />
        {(isEqual(staff, {}) || !staff) ?
          <Label basic color = 'red' pointing> Please select a staff. </Label>
          : null
        }
      </Form.Field>
    );
  }

  _renderDateTimeForm() {
    const {start, end, startTimeError, endTimeError} = this.state;
    const mStart = moment(start);
    const mEnd = moment(end);

    return(
      <Form.Group widths='equal'>
        <Form.Field error={ !mStart.isValid() }>
          <label>Date *</label>
          <DateInput
            readOnly
            dateFormat="MM-DD-YYYY"
            name="date"
            placeholder="Date"
            value={ mStart.format("l") }
            iconPosition="left"
            onChange={ (e,data) => this._handleDateChange(e, data) }
          />
          {!mStart.isValid() ?
            <Label basic color = 'red' pointing> Date is not valid </Label>
            : null
          }
        </Form.Field>

        <Form.Field error={ !mStart.isValid() || startTimeError } >
          <label>Start Time *</label>
          <TimeInput
            timeFormat={"AMPM"}
            closable={ true }
            readOnly
            name="start"
            placeholder="Start"
            value={ mStart.format("hh:mm A") }
            iconPosition="left"
            onChange={
              (e, data) => this._handleTimeChange(e, "start", data)
            }
          />
          {!mStart.isValid() || startTimeError ?
            <Label basic color = 'red' pointing> Start time must be before end time </Label>
            : null
          }
        </Form.Field>

        <Form.Field error={ !mEnd.isValid() || endTimeError } >
          <label>End Time *</label>
          <TimeInput
            timeFormat={"AMPM"}
            closable={ true }
            readOnly
            name="end"
            placeholder="End"
            value={ mEnd.format("hh:mm A") }
            iconPosition="left"
            onChange={
              (e, data) => this._handleTimeChange(e, "end", data)
            }
          />
          {!mEnd.isValid() || endTimeError ?
            <Label basic color = 'red' pointing> End time must be after start time </Label>
            : null
          }
        </Form.Field>
      </Form.Group>
    );
  }

  _renderRepeatHeaderForm() {
    const placeholder = this.state.repeat ? this.state.repeat : "Never";
    return(
      <Form.Field
        control={ Select }
        options={ REPEAT_CONST }
        label={{ children: 'Repeat', htmlFor: 'form-select-control-repeat' }}
        placeholder={ placeholder }
        search
        searchInput={{ id: 'form-select-control-repeat' }}
        onChange={ this._handleSelectChange }
      />
    );
  }

  _renderAttendanceForm() {
    const {isAttend} = this.state;
    return(
      <Form.Field>
        <label>{ isAttend ? "Patient attended" : "Patient did not attend" }</label>
        <Form.Radio
          toggle
          onChange={ this._handleAttendanceChange }
          checked={ isAttend }
        />
      </Form.Field>
    )
  }
  /** TODO: There functions are currently automated in the back end. Leaving it just incase of warranty period

   _handleTherapyTypeChange(event, { value }) {
    if(THERAPY_TYPE_CONST.some(element => element.value === value)) {
      this.setState({ therapyType: value });
    } else {
      this.setState({ therapyType: "" })
    }
  }

  _getTherapyTypePlaceholder(value) {
    const therapy = THERAPY_TYPE_CONST.find(elem => elem.value === value);
    return therapy ? therapy.text : "Select a Therapy Type";
  }

  _renderTypeOfTherapy() {
    const { therapyType } = this.state;
    return(
        <Form.Field
          error = { therapyType === "" }
          control={ Select }
          placeholder={ this._getTherapyTypePlaceholder(therapyType) }
          label=" Therapy Type *"
          onChange={ this._handleTherapyTypeChange }
          options={ THERAPY_TYPE_CONST }
        >
          {therapyType === "" ?
            <Label basic color = 'red' pointing> Please select a therapy type.</Label>
            : null
          }
        </Form.Field>
    );
  }
  */

  _renderModalContent() {
    const { start, isUpdateAppointment } = this.state;
    return(
      <Form>
        { this._renderPatientForm() }
        { this._renderStaffForm() }
        { this._renderDateTimeForm() }
        { moment(start).isBefore(moment()) && isUpdateAppointment ?
          this._renderAttendanceForm() : null
        }
        { /**this._renderTypeOfTherapy()**/ }
        { /** this._renderRepeatHeaderForm() */}
      </Form>
    );
  }

  render() {
    const { onClose, isOpen } = this.props;
    return(
      <Modal className="calendarPopupModal" closeIcon onClose={ onClose } open={ isOpen } >
        { this._renderModalHeader() }
        <Modal.Content children={this._renderModalContent()} />
        <Modal.Actions children={this._renderModalActionButton()} />
      </Modal>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      createAppointment: CalendarAction.createAppointment,
      updateAppointment: CalendarAction.updateAppointment,
      deleteAppointment: CalendarAction.deleteAppointment
    },
    dispatch
  );
}

export default connect(null, mapDispatchToProps)(CalendarPopup);