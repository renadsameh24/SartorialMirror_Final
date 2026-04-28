import type { GarmentCategory } from '@/types/catalog';

type CatalogCategoryTabsProps = {
  activeCategoryId: string | null;
  categories: GarmentCategory[];
  onChange: (categoryId?: string) => void;
};

export function CatalogCategoryTabs({
  activeCategoryId,
  categories,
  onChange,
}: CatalogCategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-sm" role="group" aria-label="Catalog categories">
      <button
        aria-pressed={activeCategoryId === null}
        className={[
          'shopper-category-tab focus-ring inline-flex min-h-control items-center rounded-control border px-md py-sm text-label transition-all duration-standard',
          activeCategoryId === null
            ? 'border-accent bg-[linear-gradient(135deg,rgba(230,217,191,0.16),rgba(230,217,191,0.04))] text-text-primary'
            : 'border-border-subtle bg-surface-ghost text-text-secondary hover:border-border hover:bg-[rgba(255,255,255,0.03)]',
        ].join(' ')}
        onClick={() => onChange(undefined)}
        type="button"
      >
        All
      </button>
      {categories.map((category) => (
        <button
          aria-pressed={activeCategoryId === category.id}
          className={[
            'shopper-category-tab focus-ring inline-flex min-h-control items-center rounded-control border px-md py-sm text-label transition-all duration-standard',
            activeCategoryId === category.id
              ? 'border-accent bg-[linear-gradient(135deg,rgba(230,217,191,0.16),rgba(230,217,191,0.04))] text-text-primary'
              : 'border-border-subtle bg-surface-ghost text-text-secondary hover:border-border hover:bg-[rgba(255,255,255,0.03)]',
          ].join(' ')}
          key={category.id}
          onClick={() => onChange(category.id)}
          type="button"
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
