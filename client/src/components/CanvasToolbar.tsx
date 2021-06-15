import React, { ReactComponentElement } from 'react';
import PropTypes, { InferProps } from 'prop-types'
import './CanvasToolbar.css'

function CanvasToolbar({userName, userColor, eraserSelected, onSave}: InferProps<typeof CanvasToolbar.propTypes>): ReactComponentElement<any> {
  return (
    <header className="App-header">
      <div style={{backgroundColor: userColor}} className="avatar">
        {userName[0]}
      </div>
      <span>{userName.substr(1)}</span>

      <button className="header-eraser-button" onClick={evt => eraserSelected(evt)}> Eraser</button>
      <button className="header-save-button" onClick={evt => onSave(evt)}> Save</button>
    </header>
  );
}

CanvasToolbar.propTypes = {
  userName: PropTypes.string.isRequired,
  userColor: PropTypes.string.isRequired,
  eraserSelected: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default CanvasToolbar;
