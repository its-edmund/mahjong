import { useContext, useEffect, useState } from "react";
import Piece from "./piece";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { initialPieces, PieceType } from "../../utils/piece";
import { GameContext } from "../../context/GameContext";
import { Button } from "./button";

const Board = () => {
  const { state, dealPieces, updatePlayerHand } = useContext(GameContext);
  const [activeId, setActiveId] = useState(null);
  const [hand, setHand] = useState<PieceType[]>([]);

  useEffect(() => {
    setHand(state.players[0].hand);
  }, [state.players[0].hand]);

  useEffect(() => {
    updatePlayerHand(0, hand);
  }, [hand]);

  const handleDragStart = (event) => {
    const activeIndex = hand.findIndex((piece) => piece.id === event.active.id);
    setActiveId(activeIndex);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over.id) {
      const activeIndex = hand.findIndex((piece) => piece.id === active.id);
      const overIndex = hand.findIndex((piece) => piece.id === over.id);

      setHand(arrayMove(hand, activeIndex, overIndex));
    }
  };

  const sortHand = () => {
    const sortedPieces = hand.sort((a, b) => a.id - b.id);
    setHand(sortedPieces);
  };

  const arrayMove = (array, oldIndex, newIndex) => {
    const newArray = array.slice();
    newArray.splice(newIndex, 0, newArray.splice(oldIndex, 1)[0]);
    return newArray;
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <SortableContext
        items={hand}
        strategy={horizontalListSortingStrategy}
      >
        <div className="absolute bottom-8">
          <ul className="flex flex-row gap-2">
            {hand.map((piece) => (
              <Piece
                key={piece.id}
                piece={piece}
              />
            ))}
          </ul>
          <Button onClick={sortHand}>Sort</Button>
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId
          ? <Piece key={activeId} piece={state.players[0].hand[activeId]} />
          : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Board;
