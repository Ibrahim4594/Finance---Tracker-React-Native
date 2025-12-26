import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Category, TransactionType } from '../types';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AVAILABLE_ICONS = ['🍔', '🚗', '🛍️', '🎬', '💡', '💊', '📚', '✈️', '🛒', '💰', '💼', '📈', '🎁', '🏠', '📱'];
const AVAILABLE_COLORS = ['#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9'];

export default function ManageCategoriesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('🍔');
  const [newCategoryColor, setNewCategoryColor] = useState('#FF6B6B');
  const [newCategoryType, setNewCategoryType] = useState<TransactionType>('expense');

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    addCategory({
      name: newCategoryName.trim(),
      icon: newCategoryIcon,
      color: newCategoryColor,
      type: newCategoryType,
    });

    resetForm();
    setShowAddModal(false);
    Alert.alert('Success', 'Category added successfully!');
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryIcon(category.icon);
    setNewCategoryColor(category.color);
    setNewCategoryType(category.type);
    setShowAddModal(true);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;

    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    updateCategory(editingCategory.id, {
      name: newCategoryName.trim(),
      icon: newCategoryIcon,
      color: newCategoryColor,
      type: newCategoryType,
    });

    resetForm();
    setShowAddModal(false);
    Alert.alert('Success', 'Category updated successfully!');
  };

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCategory(category.id);
            Alert.alert('Success', 'Category deleted successfully!');
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setNewCategoryName('');
    setNewCategoryIcon('🍔');
    setNewCategoryColor('#FF6B6B');
    setNewCategoryType('expense');
    setEditingCategory(null);
  };

  const expenseCategories = categories.filter((cat) => cat.type === 'expense');
  const incomeCategories = categories.filter((cat) => cat.type === 'income');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manage Categories</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.lg }]}
      >
        {/* Expense Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expense Categories ({expenseCategories.length})</Text>
          {expenseCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          ))}
        </View>

        {/* Income Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Income Categories ({incomeCategories.length})</Text>
          {incomeCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          ))}
        </View>
      </ScrollView>

      {/* Add/Edit Category Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + SPACING.lg }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  resetForm();
                  setShowAddModal(false);
                }}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Category Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category Name</Text>
                <TextInput
                  style={styles.input}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder="e.g., Groceries"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>

              {/* Category Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      newCategoryType === 'expense' && styles.typeButtonActive,
                    ]}
                    onPress={() => setNewCategoryType('expense')}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        newCategoryType === 'expense' && styles.typeButtonTextActive,
                      ]}
                    >
                      Expense
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      newCategoryType === 'income' && styles.typeButtonActive,
                    ]}
                    onPress={() => setNewCategoryType('income')}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        newCategoryType === 'income' && styles.typeButtonTextActive,
                      ]}
                    >
                      Income
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Icon Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Icon</Text>
                <View style={styles.iconGrid}>
                  {AVAILABLE_ICONS.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconButton,
                        newCategoryIcon === icon && styles.iconButtonActive,
                      ]}
                      onPress={() => setNewCategoryIcon(icon)}
                    >
                      <Text style={styles.iconText}>{icon}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Color Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Color</Text>
                <View style={styles.colorGrid}>
                  {AVAILABLE_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorButton,
                        { backgroundColor: color },
                        newCategoryColor === color && styles.colorButtonActive,
                      ]}
                      onPress={() => setNewCategoryColor(color)}
                    />
                  ))}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={editingCategory ? handleUpdateCategory : handleAddCategory}
            >
              <Text style={styles.saveButtonText}>
                {editingCategory ? 'Update Category' : 'Add Category'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onEdit, onDelete }) => (
  <View style={[styles.categoryCard, { borderLeftColor: category.color, borderLeftWidth: 4 }]}>
    <View style={styles.categoryInfo}>
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <Text style={styles.categoryName}>{category.name}</Text>
    </View>
    <View style={styles.categoryActions}>
      <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(category)}>
        <Text style={styles.actionButtonText}>✎</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => onDelete(category)}>
        <Text style={[styles.actionButtonText, styles.deleteText]}>×</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 32,
    color: COLORS.text,
    marginTop: -4,
  },
  title: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.text,
  },
  addButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
  },
  addButtonText: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weightBold,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.xl,
  },
  section: {
    gap: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.h6,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOWS.small,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weightMedium,
    color: COLORS.text,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
    borderRadius: RADIUS.sm,
  },
  actionButtonText: {
    fontSize: 18,
    color: COLORS.text,
  },
  deleteText: {
    color: COLORS.error,
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.text,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.weightMedium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.text,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  typeButtonText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weightMedium,
    color: COLORS.text,
  },
  typeButtonTextActive: {
    color: COLORS.primary,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonActive: {
    backgroundColor: COLORS.backgroundDark,
    borderColor: COLORS.accent,
  },
  iconText: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    borderColor: COLORS.text,
    borderWidth: 3,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    margin: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.primary,
  },
});
