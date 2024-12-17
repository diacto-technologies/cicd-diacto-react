import React, { useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import MiniCard from './MiniCard';

export function Draggable(props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: props.id,
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;



  return (
    <button ref={setNodeRef} style={style} {...listeners} {...attributes} className='flex space-y-2 flex-col w-24 h-24 items-center justify-center rounded-lg bg-sky-100 shadow-md hover:outline outline-sky-600/20'>
      <div>{props.item.icon} </div>
      <label className='text-xs w-full text-center text-gray-700'>{props.item.label}</label>
    </button>
  );
}