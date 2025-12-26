import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';
import * as Haptics from 'expo-haptics';

// Mock haptics
jest.mock('expo-haptics');

describe('Button', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with correct title', () => {
      const { getByText } = render(<Button title="Click Me" onPress={() => {}} />);
      expect(getByText('Click Me')).toBeTruthy();
    });

    it('should render as primary variant by default', () => {
      const { getByText } = render(<Button title="Test" onPress={() => {}} />);
      const button = getByText('Test').parent?.parent;
      expect(button).toBeTruthy();
    });

    it('should render secondary variant', () => {
      const { getByText } = render(
        <Button title="Test" onPress={() => {}} variant="secondary" />
      );
      expect(getByText('Test')).toBeTruthy();
    });

    it('should render outline variant', () => {
      const { getByText } = render(
        <Button title="Test" onPress={() => {}} variant="outline" />
      );
      expect(getByText('Test')).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { getByText } = render(
        <Button title="Small" onPress={() => {}} size="small" />
      );
      expect(getByText('Small')).toBeTruthy();
    });

    it('should render medium size by default', () => {
      const { getByText } = render(<Button title="Medium" onPress={() => {}} />);
      expect(getByText('Medium')).toBeTruthy();
    });

    it('should render large size', () => {
      const { getByText } = render(
        <Button title="Large" onPress={() => {}} size="large" />
      );
      expect(getByText('Large')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when pressed', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(<Button title="Press Me" onPress={onPressMock} />);

      fireEvent.press(getByText('Press Me'));

      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('should trigger haptic feedback when pressed', () => {
      const { getByText } = render(<Button title="Haptic" onPress={() => {}} />);

      fireEvent.press(getByText('Haptic'));

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('should not call onPress when disabled', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <Button title="Disabled" onPress={onPressMock} disabled />
      );

      fireEvent.press(getByText('Disabled'));

      expect(onPressMock).not.toHaveBeenCalled();
    });

    it('should not trigger haptics when disabled', () => {
      const { getByText } = render(
        <Button title="Disabled" onPress={() => {}} disabled />
      );

      fireEvent.press(getByText('Disabled'));

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should apply disabled style when disabled', () => {
      const { getByText } = render(
        <Button title="Disabled Button" onPress={() => {}} disabled />
      );

      const buttonContainer = getByText('Disabled Button').parent?.parent;
      expect(buttonContainer?.props.disabled).toBe(true);
    });

    it('should not be disabled by default', () => {
      const { getByText } = render(<Button title="Enabled" onPress={() => {}} />);

      const buttonContainer = getByText('Enabled').parent?.parent;
      expect(buttonContainer?.props.disabled).toBe(false);
    });
  });

  describe('Gradient', () => {
    it('should render with gradient when gradient prop is true', () => {
      const { getByText } = render(
        <Button title="Gradient" onPress={() => {}} gradient />
      );
      expect(getByText('Gradient')).toBeTruthy();
    });

    it('should render without gradient by default', () => {
      const { getByText } = render(<Button title="No Gradient" onPress={() => {}} />);
      expect(getByText('No Gradient')).toBeTruthy();
    });
  });

  describe('Custom Styles', () => {
    it('should accept custom button style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByText } = render(
        <Button title="Custom" onPress={() => {}} style={customStyle} />
      );
      expect(getByText('Custom')).toBeTruthy();
    });

    it('should accept custom text style', () => {
      const customTextStyle = { color: 'blue' };
      const { getByText } = render(
        <Button title="Custom Text" onPress={() => {}} textStyle={customTextStyle} />
      );
      expect(getByText('Custom Text')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should render with empty title', () => {
      const { getByText } = render(<Button title="" onPress={() => {}} />);
      expect(getByText('')).toBeTruthy();
    });

    it('should handle multiple presses', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(<Button title="Multi Press" onPress={onPressMock} />);

      const button = getByText('Multi Press');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(onPressMock).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid presses', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(<Button title="Rapid" onPress={onPressMock} />);

      const button = getByText('Rapid');
      for (let i = 0; i < 10; i++) {
        fireEvent.press(button);
      }

      expect(onPressMock).toHaveBeenCalledTimes(10);
    });
  });
});
