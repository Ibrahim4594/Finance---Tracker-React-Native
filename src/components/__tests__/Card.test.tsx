import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import Card from '../Card';
import { SPACING } from '../../constants/theme';

describe('Card', () => {
  describe('Rendering', () => {
    it('should render children correctly', () => {
      const { getByText } = render(
        <Card>
          <Text>Card Content</Text>
        </Card>
      );

      expect(getByText('Card Content')).toBeTruthy();
    });

    it('should render multiple children', () => {
      const { getByText } = render(
        <Card>
          <Text>First Child</Text>
          <Text>Second Child</Text>
        </Card>
      );

      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
    });

    it('should render with default styling', () => {
      const { getByText } = render(
        <Card>
          <Text>Default Card</Text>
        </Card>
      );

      const cardContent = getByText('Default Card');
      expect(cardContent).toBeTruthy();
    });
  });

  describe('Variants', () => {
    it('should render as regular card by default', () => {
      const { getByText } = render(
        <Card>
          <Text>Regular Card</Text>
        </Card>
      );

      expect(getByText('Regular Card')).toBeTruthy();
    });

    it('should render with gradient when gradient prop is true', () => {
      const { getByText } = render(
        <Card gradient>
          <Text>Gradient Card</Text>
        </Card>
      );

      expect(getByText('Gradient Card')).toBeTruthy();
    });

    it('should render with blur when blur prop is true', () => {
      const { getByText } = render(
        <Card blur>
          <Text>Blur Card</Text>
        </Card>
      );

      expect(getByText('Blur Card')).toBeTruthy();
    });

    it('should prioritize gradient over blur when both are true', () => {
      const { getByText } = render(
        <Card gradient blur>
          <Text>Both Props</Text>
        </Card>
      );

      expect(getByText('Both Props')).toBeTruthy();
    });
  });

  describe('Padding', () => {
    it('should use default padding', () => {
      const { getByText } = render(
        <Card>
          <Text>Default Padding</Text>
        </Card>
      );

      const cardContainer = getByText('Default Padding').parent;
      expect(cardContainer?.props.style).toContainEqual(
        expect.objectContaining({ padding: SPACING.md })
      );
    });

    it('should accept custom padding', () => {
      const customPadding = 20;
      const { getByText } = render(
        <Card padding={customPadding}>
          <Text>Custom Padding</Text>
        </Card>
      );

      const cardContainer = getByText('Custom Padding').parent;
      expect(cardContainer?.props.style).toContainEqual(
        expect.objectContaining({ padding: customPadding })
      );
    });

    it('should accept zero padding', () => {
      const { getByText } = render(
        <Card padding={0}>
          <Text>Zero Padding</Text>
        </Card>
      );

      const cardContainer = getByText('Zero Padding').parent;
      expect(cardContainer?.props.style).toContainEqual(
        expect.objectContaining({ padding: 0 })
      );
    });
  });

  describe('Custom Styles', () => {
    it('should accept custom style prop', () => {
      const customStyle = { backgroundColor: 'red', margin: 10 };
      const { getByText } = render(
        <Card style={customStyle}>
          <Text>Custom Style</Text>
        </Card>
      );

      expect(getByText('Custom Style')).toBeTruthy();
    });

    it('should merge custom styles with default styles', () => {
      const customStyle = { borderWidth: 2 };
      const { getByText } = render(
        <Card style={customStyle}>
          <Text>Merged Styles</Text>
        </Card>
      );

      const cardContainer = getByText('Merged Styles').parent;
      expect(cardContainer?.props.style).toContainEqual(
        expect.objectContaining(customStyle)
      );
    });
  });

  describe('Edge Cases', () => {
    it('should render with no children', () => {
      const { container } = render(<Card />);
      expect(container).toBeTruthy();
    });

    it('should render with null children', () => {
      const { container } = render(<Card>{null}</Card>);
      expect(container).toBeTruthy();
    });

    it('should render with undefined children', () => {
      const { container } = render(<Card>{undefined}</Card>);
      expect(container).toBeTruthy();
    });

    it('should render with nested Cards', () => {
      const { getByText } = render(
        <Card>
          <Card>
            <Text>Nested Card</Text>
          </Card>
        </Card>
      );

      expect(getByText('Nested Card')).toBeTruthy();
    });

    it('should handle complex children structures', () => {
      const { getByText } = render(
        <Card>
          <Text>Title</Text>
          <Text>Subtitle</Text>
          <Text>Content</Text>
        </Card>
      );

      expect(getByText('Title')).toBeTruthy();
      expect(getByText('Subtitle')).toBeTruthy();
      expect(getByText('Content')).toBeTruthy();
    });
  });

  describe('Component Types', () => {
    it('should render gradient variant as LinearGradient', () => {
      const { getByText } = render(
        <Card gradient>
          <Text>Gradient Component</Text>
        </Card>
      );

      expect(getByText('Gradient Component')).toBeTruthy();
    });

    it('should render blur variant as BlurView', () => {
      const { getByText } = render(
        <Card blur>
          <Text>Blur Component</Text>
        </Card>
      );

      expect(getByText('Blur Component')).toBeTruthy();
    });

    it('should render default variant as View', () => {
      const { getByText } = render(
        <Card>
          <Text>View Component</Text>
        </Card>
      );

      expect(getByText('View Component')).toBeTruthy();
    });
  });
});
