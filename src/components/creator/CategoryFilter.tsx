import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import type { Category } from '@/types/database'

interface CategoryFilterProps {
  selectedCategory: string | null
  onCategoryChange: (categoryId: string | null) => void
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      return data as Category[]
    },
  })

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 bg-muted rounded-full animate-pulse shrink-0"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Badge
        variant={selectedCategory === null ? 'default' : 'outline'}
        className="cursor-pointer shrink-0 hover:bg-primary/80 transition-colors"
        onClick={() => onCategoryChange(null)}
      >
        All
      </Badge>
      {categories?.map((category) => (
        <Badge
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          className="cursor-pointer shrink-0 hover:bg-primary/80 transition-colors"
          onClick={() => onCategoryChange(category.id)}
        >
          {category.icon && <span className="mr-1">{category.icon}</span>}
          {category.name}
        </Badge>
      ))}
    </div>
  )
}
