import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: 'en' | 'ar') => {
    i18n.changeLanguage(lng);
  };

  return (
    <Card className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Globe className="h-5 w-5 mr-2" />
        Language
      </h3>
      <div className="flex gap-2">
        <Button
          onClick={() => changeLanguage('en')}
          variant={i18n.language === 'en' ? 'default' : 'outline'}
        >
          English
        </Button>
        <Button
          onClick={() => changeLanguage('ar')}
          variant={i18n.language === 'ar' ? 'default' : 'outline'}
        >
          العربية
        </Button>
      </div>
    </Card>
  );
}; 