import { useState, useEffect, useCallback, useMemo } from 'react';
import { Category } from '../../shared/types/task';

// Categorias padrão do sistema
const DEFAULT_CATEGORIES: Partial<Category>[] = [
  {
    id: 1,
    name: 'Backlog',
    color: '#6B7280',
    icon: 'ClipboardList',
    isSystem: true,
    order: 1
  },
  {
    id: 2,
    name: 'Esta Semana',
    color: '#3B82F6',
    icon: 'CalendarDays',
    isSystem: true,
    order: 2
  },
  {
    id: 3,
    name: 'Hoje',
    color: '#F59E0B',
    icon: 'Zap',
    isSystem: true,
    order: 3
  },
  {
    id: 4,
    name: 'Concluído',
    color: '#10B981',
    icon: 'CheckCircle',
    isSystem: true,
    order: 4
  }
];

export const useCategories = (tasks?: any[]) => {
  // Initialize with default categories to ensure they're always available
  const [categories, setCategories] = useState<Category[]>(() => {
    // Try to load from localStorage immediately during initialization
    try {
      const stored = localStorage.getItem('krigzis_categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          console.log('🎯 useCategories: Loaded categories from localStorage during init:', parsed.length);
          return parsed;
        }
      }
    } catch (err) {
      console.warn('⚠️ useCategories: Failed to load categories during init:', err);
    }
    
    // Fallback to default categories
    const defaultCategories = DEFAULT_CATEGORIES.map((cat, index) => ({
      ...cat,
      id: cat.id || index + 1,
      workspace_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })) as Category[];
    
    console.log('🔧 useCategories: Using default categories during init:', defaultCategories.length);
    return defaultCategories;
  });
  const [loading, setLoading] = useState(false); // Start with false since we have initial data
  const [error, setError] = useState<string | null>(null);

  // Carregar categorias do localStorage
  const loadCategories = useCallback(() => {
    try {
      console.log('🔄 useCategories: Loading categories from localStorage...');
      setLoading(true);
      const stored = localStorage.getItem('krigzis_categories');
      let categoriesToSet: Category[] = [];
      
      if (stored) {
        const parsed = JSON.parse(stored);
        // Verificar se tem pelo menos as categorias do sistema
        const hasSystemCategories = parsed.some((cat: any) => cat.isSystem);
        if (!hasSystemCategories) {
          // Se não tem categorias do sistema, adicionar
          const initialCategories = DEFAULT_CATEGORIES.map((cat, index) => ({
            ...cat,
            id: cat.id || index + 1,
            workspace_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })) as Category[];
          
          categoriesToSet = [...initialCategories, ...parsed];
          localStorage.setItem('krigzis_categories', JSON.stringify(categoriesToSet));
        } else {
          categoriesToSet = parsed;
        }
      } else {
        // Inicializar com categorias padrão
        categoriesToSet = DEFAULT_CATEGORIES.map((cat, index) => ({
          ...cat,
          id: cat.id || index + 1,
          workspace_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })) as Category[];
        
        localStorage.setItem('krigzis_categories', JSON.stringify(categoriesToSet));
      }
      
      // CORREÇÃO: Garantir que sempre temos as 4 categorias padrão
      const systemCategoryNames = ['Backlog', 'Esta Semana', 'Hoje', 'Concluído'];
      const existingSystemCategories = categoriesToSet.filter(cat => cat.isSystem);
      
      // Se não temos todas as 4 categorias do sistema, recriar
      if (existingSystemCategories.length < 4) {
        const missingCategories = DEFAULT_CATEGORIES.filter(defaultCat => 
          !existingSystemCategories.find(existing => existing.name === defaultCat.name)
        );
        
        const completedSystemCategories = missingCategories.map((cat, index) => ({
          ...cat,
          id: cat.id || (Date.now() + index),
          workspace_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })) as Category[];
        
        categoriesToSet = [...existingSystemCategories, ...completedSystemCategories, ...categoriesToSet.filter(cat => !cat.isSystem)];
        localStorage.setItem('krigzis_categories', JSON.stringify(categoriesToSet));
      }
      
      console.log('✅ useCategories: Categories loaded:', categoriesToSet.length, categoriesToSet.map(c => c.name));
      setCategories(categoriesToSet);
      
    } catch (err) {
      setError('Erro ao carregar categorias');
      console.error('Error loading categories:', err);
      
      // Em caso de erro, forçar categorias padrão
      const defaultCategories = DEFAULT_CATEGORIES.map((cat, index) => ({
        ...cat,
        id: cat.id || index + 1,
        workspace_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) as Category[];
      
      setCategories(defaultCategories);
      localStorage.setItem('krigzis_categories', JSON.stringify(defaultCategories));
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar categorias no localStorage
  const saveCategories = useCallback((newCategories: Category[]) => {
    localStorage.setItem('krigzis_categories', JSON.stringify(newCategories));
    setCategories(newCategories);
    
    // Disparar evento customizado para notificar mudanças
    window.dispatchEvent(new CustomEvent('categoriesUpdated', { detail: newCategories }));
  }, []);

  // Criar nova categoria
  const createCategory = useCallback((data: Partial<Category>) => {
          // Creating new category
    
    const newCategory: Category = {
      id: Date.now(),
      name: data.name || 'Nova Categoria',
      color: data.color || '#7B3FF2',
      icon: data.icon || 'Folder',
      workspace_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isSystem: false,
      order: categories.length + 1,
      ...data
    };

    console.log('🔍 useCategories: Nova categoria criada:', newCategory);

    const updatedCategories = [...categories, newCategory];
    console.log('🔍 useCategories: Categorias atualizadas:', updatedCategories);
    
    saveCategories(updatedCategories);
    return newCategory;
  }, [categories, saveCategories]);

  // Atualizar categoria (incluindo sistema)
  const updateCategory = useCallback((id: number, data: Partial<Category>) => {
    const updatedCategories = categories.map(cat => 
      cat.id === id 
        ? { ...cat, ...data, updated_at: new Date().toISOString() }
        : cat
    );
    saveCategories(updatedCategories);
  }, [categories, saveCategories]);

  // Deletar categoria (incluindo sistema)
  const deleteCategory = useCallback((id: number) => {
    const updatedCategories = categories.filter(cat => cat.id !== id);
    saveCategories(updatedCategories);
    return true;
  }, [categories, saveCategories]);

  // Contar tarefas por categoria usando dados em tempo real
  const getTaskCountByCategory = useCallback((categoryId: number) => {
    if (!tasks || !Array.isArray(tasks)) {
      console.log(`No tasks available for counting. Tasks: ${tasks ? (tasks as any[]).length : 'null'}`);
      return 0;
    }
    
    try {
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) {
        console.log(`Category with id ${categoryId} not found`);
        return 0;
      }

      if (category.isSystem) {
        // Para categorias do sistema, mapear pelo status
        const statusMap: { [key: string]: string } = {
          'Backlog': 'backlog',
          'Esta Semana': 'esta_semana',
          'Hoje': 'hoje',
          'Concluído': 'concluido'
        };
        
        const targetStatus = statusMap[category.name];
        const count = tasks.filter((task: any) => task.status === targetStatus).length;
        
        return count;
      } else {
        // Para categorias customizadas, usar category_id
        const count = tasks.filter((task: any) => task.category_id === categoryId).length;
        
        return count;
      }
    } catch (err) {
      console.error('Error counting tasks for category:', categoryId, err);
      return 0;
    }
  }, [categories, tasks]);

  // Usar useMemo para recalcular automaticamente quando tasks ou categories mudam
  const categoriesWithCount = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      task_count: getTaskCountByCategory(cat.id)
    }));
  }, [categories, getTaskCountByCategory, tasks]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Escutar eventos de atualização de tarefas para recalcular contadores
  useEffect(() => {
    const handleTasksUpdate = () => {
      console.log('🔄 useCategories: Tasks updated, recalculating counts...');
      // Forçar recálculo através de uma atualização do estado
      setCategories(prev => [...prev]);
    };

    window.addEventListener('tasksUpdated', handleTasksUpdate);
    
    return () => {
      window.removeEventListener('tasksUpdated', handleTasksUpdate);
    };
  }, []);

  return {
    categories: categoriesWithCount,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    reloadCategories: loadCategories
  };
};

 