import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  icon?: ReactNode;
}

interface MobileAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
}

export function MobileAccordion({
  items,
  allowMultiple = false,
  defaultOpen = []
}: MobileAccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems(prev =>
        prev.includes(id)
          ? prev.filter(item => item !== id)
          : [...prev, id]
      );
    } else {
      setOpenItems(prev =>
        prev.includes(id) ? [] : [id]
      );
    }
  };

  return (
    <div className="w-full space-y-2">
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);

        return (
          <div
            key={item.id}
            className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors tap-target"
            >
              <div className="flex items-center gap-3">
                {item.icon && (
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {item.icon}
                  </span>
                )}
                <span className="font-medium text-neutral-900 dark:text-white">
                  {item.title}
                </span>
              </div>
              <ChevronDown
                size={20}
                className={`text-neutral-600 dark:text-neutral-400 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? 'max-h-[1000px]' : 'max-h-0'
              }`}
            >
              <div className="p-4 pt-0 text-neutral-700 dark:text-neutral-300">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
