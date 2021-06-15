import PropTypes, { InferProps } from 'prop-types'
import React, { ReactComponentElement, useEffect, useRef, useState } from 'react'
import { MARKUPS } from '../utils/enums'
import { getMousePos, setupCanvas } from '../utils/util'
import Canvas from './Canvas'
import { useMutation, useQuery, useSubscription } from '@apollo/client'
import { ADD_MARKUP_TO_CANVAS, GET_ALL_MARKUPS, ON_MARKUPS_ADDED, UPLOAD_PNG_BLOB } from '../graphQL'
import './CanvasWrapper.css'
import CanvasToolbar from './CanvasToolbar'

interface Point {
  x: number
  y: number
}

interface MarkupJson {
  type: number
  points: Point[]
  user: { name: string }
}

class Markup {
  private readonly type: number;
  private points: Point[] = [];

  constructor(type: number) {
    this.type = type;
  }

  public drawWithEvent(ctx: CanvasRenderingContext2D, evt: MouseEvent): void {
    const pos = getMousePos( ctx?.canvas as HTMLCanvasElement, evt );
    this.type === MARKUPS.PEN ? this.draw( ctx, pos ) : this.erase( ctx, pos );
  }

  public draw(ctx: CanvasRenderingContext2D, pos: Point): void {
    ctx.globalCompositeOperation = "source-over";
    ctx.lineTo( pos.x, pos.y )
    ctx.stroke()
    this.addPoints( pos as Point );
  }

  public erase(ctx: CanvasRenderingContext2D, pos: Point) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.arc( pos.x, pos.y, 4, 0, Math.PI * 2, false );
    ctx.fill();
    this.addPoints( pos as Point );
  }

  public toJson(name: string): MarkupJson {
    return {
      type: this.type,
      points: this.points,
      user: { name: name }
    }
  }

  private addPoints(point: Point) {
    this.points.push( point );
  }
}

interface CanvasWrapperState {
  ctx: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
}

function CanvasWrapper({
                         color,
                         user
                       }: InferProps<typeof CanvasWrapper.propTypes>): ReactComponentElement<any> {

  const queryData = useQuery( GET_ALL_MARKUPS ) // to render markups on canvas for initial load
  const [ addMarkups ] = useMutation( ADD_MARKUP_TO_CANVAS ) // user add markups
  const markupSubscriptionData = useSubscription( ON_MARKUPS_ADDED ) // subscription for markups whenever any user adds
  const [ uploadImgUrl ] = useMutation( UPLOAD_PNG_BLOB ) // uploads png data url to server
  const [ state, setState ] = useState<CanvasWrapperState>();
  const [ canvasMode, setCanvasMode ] = useState( MARKUPS.PEN ) // state for canvas modes to draw pen or erase them
  const ref = useRef<any>();

  let currentObject: any = null,
    canDraw = false;

  const onMouseDown = () => canDraw = true
  const onMouseUp = () => canDraw = false
  const onMouseMove = (evt: MouseEvent) => {
    if ( !state || !state.ctx ) {
      return
    }

    if ( canDraw ) {
      currentObject = currentObject || new Markup( canvasMode )
      return currentObject.drawWithEvent( state.ctx, evt )
    }

    state.ctx.beginPath();
    // logic to push the object to server

    if ( currentObject ) {
      addMarkups( { variables: { markup: currentObject.toJson( user ) } } ).catch( err => console.log );
      currentObject = null;
      setCanvasMode( MARKUPS.PEN );
    }
    // currentObject = new Markup( MARKUPS.PEN );
  }
  const addMarkupsToCanvas = function (addedMarkup: any, force?: boolean) {

    // don't want to add markup for the same user
    // since the event has been received to owner
    // owner's canvas should not be redrawn.
    if ( !addedMarkup || (user === addedMarkup.user.name && !force) || !state ) {
      return;
    }

    const markup = new Markup( addedMarkup.type )
    const currentColor = state.ctx.strokeStyle

    state.ctx.strokeStyle = addedMarkup.user.color;
    state.ctx.beginPath();

    addedMarkup.points.forEach( (point: Point) => {
      addedMarkup.type ? markup.draw( state.ctx, point ) : markup.erase( state.ctx, point );
    } )
    state.ctx.strokeStyle = currentColor;
  }

  useEffect( () => {
    if ( markupSubscriptionData.data && markupSubscriptionData.data.onMarkupAdded ) {
      addMarkupsToCanvas( markupSubscriptionData.data.onMarkupAdded )
    }
  }, [ markupSubscriptionData.data ] )

  useEffect( () => {
    if ( !queryData || !queryData.data ) {
      return
    }

    queryData.data.getMarkupsForCanvas.forEach( (markup: any) => {
      addMarkupsToCanvas( markup, true );
    } )
  }, [ queryData.data ] )

  useEffect( () => {
    const canvas = document.querySelector( '.js-2d-canvas' ) as HTMLCanvasElement
    const ctx = canvas?.getContext && canvas?.getContext( '2d' ) as CanvasRenderingContext2D

    if ( !ctx || !canvas ) {
      return
    }

    // preparing canvas with initial setup & making ready to draw
    if ( !state ) {
      setupCanvas( ctx, { color } )
      canvas.addEventListener( 'mousemove', onMouseMove )
    }

    // There's no use case that this Canvas is going to be destroyed.
    // Otherwise I would have added to remove these event listeners
    // to gain performance boost by return a cleanup function.
    setState( {
      canvas: canvas,
      ctx: ctx
    } )

  }, [] )

  const onSave = () => {
    if ( !state ) {
      return
    }

    const destinationCanvas = document.createElement( "canvas" );
    destinationCanvas.width = state.canvas.width;
    destinationCanvas.height = state.canvas.height;

    const destCtx = destinationCanvas.getContext( '2d' );

    if ( !destCtx ) {
      return
    }

    destCtx.fillStyle = "#FFFFFF";
    destCtx.fillRect( 0, 0, state.canvas.width, state.canvas.height );
    destCtx.drawImage( state.canvas, 0, 0 );

    uploadImgUrl( { variables: { imgData: destinationCanvas.toDataURL( "image/png" ) as string } } ).catch( err => err );
  }

  return (
    <div className="canvas-wrapper-component">
      <div className="canvas-toolbar-parent-el">
        <CanvasToolbar userName={user} userColor={color} eraserSelected={() => setCanvasMode( MARKUPS.ERASER )}
                       onSave={onSave}/>
      </div>
      <div className="canvas-parent-el">
        <Canvas ref={ref} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseDown={onMouseDown}
                color={color}/>
      </div>
    </div>

  );
}

CanvasWrapper.propTypes = {
  color: PropTypes.string.isRequired,
  user: PropTypes.string.isRequired
};

export default CanvasWrapper;