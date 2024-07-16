import { useState } from "react";
import Piece from "./piece";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";

const Board = () => {
    const [pieces, setPieces] = useState([{ id: '1', image: hatsu }, { id: '2', image: pin1 }, { id: '3', image: pin1 }])

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setPieces((prevPieces) => {
                const activeIndex = prevPieces.findIndex((piece) => piece.id === active.id);
                const overIndex = prevPieces.findIndex((piece) => piece.id === over.id);

                return arrayMove(prevPieces, activeIndex, overIndex);
            });
        }
    };

    const arrayMove = (array, oldIndex, newIndex) => {
        const newArray = array.slice();
        newArray.splice(newIndex, 0, newArray.splice(oldIndex, 1)[0]);
        return newArray;
    };

    return <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <SortableContext items={pieces} strategy={horizontalListSortingStrategy}>
            <ul className="flex flex-row gap-2">
                {pieces.map(piece => <Piece key={piece.id} id={piece.id} imageSrc={piece.image} />)}
            </ul>
        </SortableContext>
    </DndContext>

}

export default Board;