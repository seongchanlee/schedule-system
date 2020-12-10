import React from 'react';
import Toolbar from 'react-big-calendar/lib/Toolbar';

class CustomToolbar extends Toolbar {

  navigate(action) {
    this.props.onNavigate(action);
  }

  render() {
    return (
      <div className="rbc-toolbar">
        <div className="rbc-btn-group non-printable">
          <button type="button" onClick={() => this.navigate('PREV')}>{"<"}</button>
          <button type="button" onClick={() => this.navigate('TODAY')} >Today</button>
          <button type="button" onClick={() => this.navigate('NEXT')}>{">"}</button>
        </div>
        <span className="rbc-toolbar-label">{this.props.label}</span>
        <div className="rbc-btn-group non-printable">
          <button type="button" onClick={this.view.bind(null, 'day')}>Day</button>
          <button type="button" onClick={this.view.bind(null, 'work_week')}>Work Week</button>
          <button type="button" onClick={this.view.bind(null, 'month')}>Month</button>
        </div>
      </div>
    );
  }
};

export default CustomToolbar;