import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Modal, Menu, Input, Table } from 'semantic-ui-react';
import { CalendarAction } from "actions";
import { isEqual } from 'lodash';

const USER_TYPE_MAP = {
  staff: "Staff",
  patient: "Patient"
};

const DIR_MAP = {
  "1" : "ascending",
  "-1" : "descending"
}

class PatientStaffSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredItems: props.patientsStaffs || [],
      searchText: "",
      filter: "all",
      sortKeys: [],
      sortDirection: 1, // 1 means ascending and -1 means descending
    }
    this._handleMenuItemClick = this._handleMenuItemClick.bind(this);
    this._handleSearchInputChange = this._handleSearchInputChange.bind(this);
    this._handleUserSelect = this._handleUserSelect.bind(this);
  }

  _handleMenuItemClick(event, data) {
    const { patientsStaffs } = this.props;
    const { sortDirection, sortKeys, searchText } = this.state;

    this.setState({
      filter: data.name,
      filteredItems: this._getFilterdAndSortedItems(patientsStaffs, sortDirection, sortKeys, data.name, searchText)
    });
  }

  _handleSearchInputChange(event, { value }) {
    const { patientsStaffs } = this.props;
    const { sortDirection, sortKeys, filter } = this.state;
    this.setState({
      searchText: value,
      filteredItems: this._getFilterdAndSortedItems(patientsStaffs, sortDirection, sortKeys, filter, value)
    });
  }

  handleSort(keys) {
    const { patientsStaffs } = this.props;
    const { sortDirection, filter, searchText } = this.state;
    const newDirection = sortDirection === 1 ? -1 : 1;
    this.setState({
      filteredItems: this._getFilterdAndSortedItems(patientsStaffs, newDirection, keys, filter, searchText),
      sortDirection: newDirection,
      sortKeys: keys
    });
  }

  _handleUserSelect(user) {
    this.props.fetchAppointments(user);
    this.props.onClose();
  }

  _getFilterdAndSortedItems(arr, dir, keys, filter, searchText) {
    const filteredItems = this._getSearchTextFilteredItems(this._getTypeFilteredItems(arr, filter), searchText);
    return this._getSortedItems(filteredItems, dir, keys);
  };

  _getTypeFilteredItems(arr, filter) {
    return (filter === "patient" || filter === "staff") ? arr.filter(user => user.type === USER_TYPE_MAP[filter]) : arr;
  }

  _getSearchTextFilteredItems(arr, searchText) {
    return arr.filter(item => {
      const fullName = `${item.first_name} ${item.last_name}`;
      return fullName.toLowerCase().includes(searchText.toLowerCase());
    });
  }

  _getSortedItems(arr, dir, keys) {
    if (keys.length === 0) return arr;

    return arr.sort((user1, user2) => {
      const comparable1 = keys.reduce((acc, key) => acc + user1[key], "");
      const comparable2 = keys.reduce((acc, key) => acc + user2[key], "");
      if (comparable1 > comparable2)
        return dir;
      if (comparable1 < comparable2)
        return -1 * dir;
      return 0;
    });
  }

  _renderTableRow(user) {
    return (
      <Table.Row
        key={ user.id }
        onClick={() => this._handleUserSelect(user)}>
        <Table.Cell content={`${user.first_name} ${user.last_name}`} />
        <Table.Cell content={user.email} />
        <Table.Cell content={user.phone_number} />
        <Table.Cell content={user.type} />
      </Table.Row>
    );
  }

  render() {
    const { onClose, isOpen } = this.props;
    const { filter, sortKeys, sortDirection, searchText, filteredItems } = this.state;
    const direction = DIR_MAP[sortDirection];
    return (
      <Modal className="calendarPopupModal" closeIcon onClose={onClose} open={isOpen} >
        <Modal.Header>
          <Menu pointing secondary>
            <Menu.Item
              name="all"
              active={filter === "all"}
              onClick={this._handleMenuItemClick}>All</Menu.Item>
            <Menu.Item
              name="staff"
              active={filter === "staff"}
              onClick={this._handleMenuItemClick}>Staff</Menu.Item>
            <Menu.Item
              name="patient"
              active={filter === "patient"}
              onClick={this._handleMenuItemClick}>Patients</Menu.Item>
          </Menu>
        </Modal.Header>

        <Modal.Content>
          <Input
            icon="search"
            iconPosition="left"
            placeholder={searchText === "" ? "Search" : searchText}
            onChange={this._handleSearchInputChange} />

          <Table basic="very" columns={4} selectable sortable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell
                  sorted={ isEqual(sortKeys, ["first_name", "last_name"]) ? direction : null }
                  onClick={this.handleSort.bind(this, ["first_name", "last_name"])}>
                  Name
              </Table.HeaderCell>
                <Table.HeaderCell
                  sorted={ isEqual(sortKeys, ["email"]) ? direction : null }
                  onClick={this.handleSort.bind(this, ["email"])}>
                  Email
              </Table.HeaderCell>
                <Table.HeaderCell
                  sorted={ isEqual(sortKeys, ["phone_number"]) ? direction : null }
                  onClick={this.handleSort.bind(this, ["phone_number"])}>
                  Phone
              </Table.HeaderCell>
                <Table.HeaderCell
                  sorted={ isEqual(sortKeys, ["type"]) ? direction : null }
                  onClick={this.handleSort.bind(this, ["type"])}>
                  User Type
              </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body
              children={ filteredItems.map(this._renderTableRow.bind(this)) } />
          </Table>
        </Modal.Content>
      </Modal>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    { fetchAppointments: CalendarAction.fetchAppointments },
    dispatch
  );
}

export default connect(null, mapDispatchToProps)(PatientStaffSearch);