import React, { Component } from "react";
import { Search } from "semantic-ui-react";

class SearchInput extends Component {
  constructor(props) {
    super(props);
    const {formType, results, selectedUser} = props;
    this.state = {
      formType: formType,
      selectedUser: selectedUser,
      filteredResults: this._initialFilterResult(results, formType),
      searchText: selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : ""
    }

    this.handleResultSelect = this.handleResultSelect.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
  }

  /**
   * It will return an arry of user with user.formType === param.formType
   * @param  {Array}  results [patients and staffs passed down as props]
   * @param  {String} formType    [Enum: "Patient", "Staff"]
   * @return {Array}         [filtered results with elements that have formType === param.formType]
   */
  _initialFilterResult(results = [], formType) {
    return results.filter(user => user.type === formType);
  }

  handleResultSelect(e, { result }) {
    if (result) {
      const { formType } = this.state;
      const { isSelectedUser } = this.props;

      if (!isSelectedUser) {
        this.setState({
          selectedUser : result,
          searchText: `${result.first_name} ${result.last_name}`
        });
        this.props.handleSearchInputSelect(result, formType);
      }
    }
  }

  handleSearchChange(e, { value }) {
    const { formType } = this.state;
    const { isSelectedUser } = this.props;

    if (!isSelectedUser) {
      const filteredResults = (this.props.results || [])
        .filter(user => ( user.title && user.title.toLowerCase().includes(value.toLowerCase())) &&
         user.type === formType);
      this.setState({ searchText: value, filteredResults});
      this.props.handleSearchInputSelect({}, formType);
    }
  }

  render() {
    const { filteredResults, searchText, selectedUser } = this.state;
    const { isSelectedUser } = this.props;
    return(
      <Search
        disabled={ isSelectedUser }
        onResultSelect={ this.handleResultSelect }
        onSearchChange={ this.handleSearchChange }
        results={ !isSelectedUser ? filteredResults : [selectedUser] }
        value={ searchText }
      />
    );
  }
}

export default SearchInput;