import React, { Component } from "react";
import {connect} from 'react-redux';
import UserTable from "./UserTable";
import { UserPopup, CreateUserPopup, DischargedPatientsPopup } from "components/containers/popup";
import { Container, Button, Menu, Input, Checkbox } from "semantic-ui-react";
import { UserAction, CreateUserAction } from "actions";


class UserContainer extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  componentWillUnmount() {
    this.props.dispatch(UserAction.setFilter("all"));
    this.props.dispatch(UserAction.setSort([]));
    this.props.dispatch(UserAction.setSearchText(""));
  }

  componentDidMount() {
    this.props.dispatch(UserAction.getUsers());
  }

  _handleMenuItemClick = (e, { name }) => {
    this.props.dispatch(UserAction.setFilter(name));
  };

  _handleSearchInputChange = (e, { value }) => {
    this.props.dispatch(UserAction.setSearchText(value));
  };

  render() {
    const { filter, searchText, filteredItems } = this.props.user;
    return (
      <Container>
        <Menu pointing secondary>
          <Menu.Item
            name="all"
            active={ filter === "all" }
            onClick={ this._handleMenuItemClick }>All</Menu.Item>
          <Menu.Item
            name="administrator"
            active={ filter === "administrator" }
            onClick={ this._handleMenuItemClick }>Administrators</Menu.Item>
          <Menu.Item
            name="staff"
            active={ filter === "staff" }
            onClick={ this._handleMenuItemClick }>Staff</Menu.Item>
          <Menu.Item
            name="patient"
            active={ filter === "patient" }
            onClick={ this._handleMenuItemClick }>Patients</Menu.Item>
        </Menu>
        <Input
          style={{ width: "28rem" }}
          icon="search"
          iconPosition="left"
          placeholder="Search"
          onChange={ this._handleSearchInputChange } />
        <Button
          primary
          style={{ margin:"1rem"}}
          onClick={ () => this.props.dispatch(CreateUserAction.openPopup()) }>Create User</Button>
        <Button
          secondary
          onClick={ () => this.props.dispatch(UserAction.getDischargedPatients()) }>Discharged Patients</Button>
        <CreateUserPopup />
        <DischargedPatientsPopup />
        <UserTable />
      </Container>
    );
  }
}
const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(UserContainer);