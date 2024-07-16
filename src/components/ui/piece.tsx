import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
type PieceProps = {
    imageSrc?: string,
    id: string
}


const Piece = ({ imageSrc, id }: PieceProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 999 : 'auto',
        transition,
    };

    return <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="relative rounded-[7px] bg-green-600 text-neutral-900 outline outline-8 outline-black w-20 h-32">
        <div className="absolute bottom-0 rounded-[7px] bg-neutral-300 text-neutral-900 w-20 h-[120px]">
            <div className="absolute bottom-0 rounded-[7px] bg-neutral-50 justify-center p-2 w-20 h-24">
                <img src={imageSrc} className='w-full h-full object-contain' />
            </div>
        </div>
    </div>
}

export default Piece