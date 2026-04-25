import React, { useState } from 'react';
import { Box, render, Text, useApp, useInput, useStdin } from 'ink';

const items = ['React', 'Vue', 'Svelte'];

const Menu = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [confirmedItem, setConfirmedItem] = useState<string | null>(null);
  const { exit } = useApp();
  const { isRawModeSupported } = useStdin();

  useInput(
    (input, key) => {
      if (key.upArrow) {
        setSelectedIndex((currentIndex) => Math.max(currentIndex - 1, 0));
        return;
      }

      if (key.downArrow) {
        setSelectedIndex((currentIndex) => Math.min(currentIndex + 1, items.length - 1));
        return;
      }

      if (key.return) {
        setConfirmedItem(items[selectedIndex]);
        return;
      }

      if (input === 'q') {
        exit();
      }
    },
    { isActive: isRawModeSupported }
  );

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color="green">
        Ink Menu Demo
      </Text>

      <Box flexDirection="column">
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;

          return (
            <Text key={`${item}-${index}`} color={isSelected ? 'cyan' : undefined} inverse={isSelected}>
              {isSelected ? '> ' : '  '}
              {item}
            </Text>
          );
        })}
      </Box>

      <Text color="gray">Use ↑/↓ to move, Enter to confirm, q to quit.</Text>

      {confirmedItem ? (
        <Text color="yellow">Selected: {confirmedItem}</Text>
      ) : (
        <Text color="gray">Selected: nothing yet</Text>
      )}
    </Box>
  );
};

render(<Menu />);
