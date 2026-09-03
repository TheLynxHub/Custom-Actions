import {CustomCard} from '@lynx_extension/common/types';
import {selectCustomCards} from '@lynx_extension/renderer/store';
import {AnimatePresence, motion, Variants} from 'framer-motion';
import {compact} from 'lodash-es';
import {useMemo} from 'react';
import {useSelector} from 'react-redux';

import ActionCard from './ActionCard/ActionCard';
import {CardIconById} from './CardIcons';

const cardVariants: Variants = {
  initial: {opacity: 0, translateY: 20},
  animate: (index: number) => ({
    opacity: 1,
    translateY: 0,
    transition: {delay: index * 0.05},
  }),
  exit: {
    opacity: 0,
    translateY: 20,
    transition: {duration: 0.15},
  },
};

type ContainerProps = {
  cards: CustomCard[];
  startIndex?: number;
};

function CardsContainer({cards, startIndex = 0}: ContainerProps) {
  return (
    <AnimatePresence mode="popLayout">
      {cards.map((card, index) => {
        const icon = CardIconById(card.icon);
        return (
          <motion.div
            exit="exit"
            key={card.id}
            layout="position"
            initial="initial"
            animate="animate"
            variants={cardVariants}
            custom={startIndex + index}>
            <ActionCard card={card} icon={icon} />
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}

type ActionCategoryProps = {startIndex?: number};

export function PinnedActions({startIndex = 0}: ActionCategoryProps = {}) {
  const customCards = useSelector(selectCustomCards);
  const pinnedCards = useMemo(
    () => compact(customCards.map(card => (card.categories?.pinned ? card : null))),
    [customCards],
  );

  return <CardsContainer cards={pinnedCards} startIndex={startIndex} />;
}

export function RecentlyActions({startIndex = 0}: ActionCategoryProps = {}) {
  const customCards = useSelector(selectCustomCards);
  const pinnedCards = useMemo(
    () => compact(customCards.map(card => (card.categories?.recentlyUsed ? card : null))),
    [customCards],
  );

  return <CardsContainer cards={pinnedCards} startIndex={startIndex} />;
}

export function AllActions({startIndex = 0}: ActionCategoryProps = {}) {
  const customCards = useSelector(selectCustomCards);
  const pinnedCards = useMemo(
    () => compact(customCards.map(card => (card.categories?.all ? card : null))),
    [customCards],
  );

  return <CardsContainer cards={pinnedCards} startIndex={startIndex} />;
}

export function ImageActions({startIndex = 0}: ActionCategoryProps = {}) {
  const customCards = useSelector(selectCustomCards);
  const pinnedCards = useMemo(
    () => compact(customCards.map(card => (card.categories?.image ? card : null))),
    [customCards],
  );

  return <CardsContainer cards={pinnedCards} startIndex={startIndex} />;
}

export function TextActions({startIndex = 0}: ActionCategoryProps = {}) {
  const customCards = useSelector(selectCustomCards);
  const pinnedCards = useMemo(
    () => compact(customCards.map(card => (card.categories?.text ? card : null))),
    [customCards],
  );

  return <CardsContainer cards={pinnedCards} startIndex={startIndex} />;
}

export function AudioActions({startIndex = 0}: ActionCategoryProps = {}) {
  const customCards = useSelector(selectCustomCards);
  const pinnedCards = useMemo(
    () => compact(customCards.map(card => (card.categories?.audio ? card : null))),
    [customCards],
  );

  return <CardsContainer cards={pinnedCards} startIndex={startIndex} />;
}
