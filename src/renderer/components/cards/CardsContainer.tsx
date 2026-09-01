import {CustomCard} from '@lynx_extension/common/types';
import {selectCustomCards} from '@lynx_extension/renderer/store';
import {compact} from 'lodash-es';
import {useMemo} from 'react';
import {useSelector} from 'react-redux';

import ActionCard from './ActionCard/ActionCard';
import {CardIconById} from './CardIcons';

type ContainerProps = {
  cards: CustomCard[];
};

function CardsContainer({cards}: ContainerProps) {
  return cards.map(card => {
    const icon = CardIconById(card.icon);
    return <ActionCard card={card} icon={icon} key={card.id} />;
  });
}

export function PinnedActions() {
  const customCards = useSelector(selectCustomCards);
  const pinnedCards = useMemo(
    () => compact(customCards.map(card => (card.categories?.pinned ? card : null))),
    [customCards],
  );

  return <CardsContainer cards={pinnedCards} />;
}

export function RecentlyActions() {
  const customCards = useSelector(selectCustomCards);
  const pinnedCards = useMemo(
    () => compact(customCards.map(card => (card.categories?.recentlyUsed ? card : null))),
    [customCards],
  );

  return <CardsContainer cards={pinnedCards} />;
}

export function AllActions() {
  const customCards = useSelector(selectCustomCards);
  const pinnedCards = useMemo(
    () => compact(customCards.map(card => (card.categories?.all ? card : null))),
    [customCards],
  );

  return <CardsContainer cards={pinnedCards} />;
}

export function ImageActions() {
  const customCards = useSelector(selectCustomCards);
  const pinnedCards = useMemo(
    () => compact(customCards.map(card => (card.categories?.image ? card : null))),
    [customCards],
  );

  return <CardsContainer cards={pinnedCards} />;
}

export function TextActions() {
  const customCards = useSelector(selectCustomCards);
  const pinnedCards = useMemo(
    () => compact(customCards.map(card => (card.categories?.text ? card : null))),
    [customCards],
  );

  return <CardsContainer cards={pinnedCards} />;
}

export function AudioActions() {
  const customCards = useSelector(selectCustomCards);
  const pinnedCards = useMemo(
    () => compact(customCards.map(card => (card.categories?.audio ? card : null))),
    [customCards],
  );

  return <CardsContainer cards={pinnedCards} />;
}
