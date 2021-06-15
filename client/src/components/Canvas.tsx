import React, { ForwardedRef, ReactComponentElement } from 'react';
import PropTypes from 'prop-types'


interface CanvasInput {
  color: string
  onMouseDown: () => {}
  onMouseUp: () => {}
  onMouseMove: (e: MouseEvent) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void

}

const Canvas = React.forwardRef<HTMLCanvasElement, CanvasInput>( ({
                                                                    color,
                                                                    onMouseDown,
                                                                    onMouseUp,
                                                                    onMouseMove,
                                                                    onMouseEnter,
                                                                    onMouseLeave
                                                                  }: CanvasInput, ref: ForwardedRef<any>): ReactComponentElement<any> => {
  return (
    <canvas ref={ref} className="js-2d-canvas"
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            // @ts-ignore
            onMouseMove={onMouseMove}/>
  );
} )

Canvas.propTypes = {
  color: PropTypes.string.isRequired,
  onMouseDown: PropTypes.func.isRequired,
  onMouseUp: PropTypes.func.isRequired,
  onMouseMove: PropTypes.func.isRequired,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func
};

Canvas.displayName = 'Canvas';

export default Canvas;
