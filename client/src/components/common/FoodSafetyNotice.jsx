import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const FoodSafetyBanner = ({ compact = false }) => {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="bg-[#FFF9F2] border border-[#FFE2C5] rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#8A5016]">
        <ShieldAlert className="w-4 h-4 text-[#FF8A45] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">{t('safety_disclaimer_title')}: </span>
          <span>{t('safety_disclaimer_text')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F4F9F6] border border-[#CDE5D8] rounded-2xl p-5 my-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-[#16845B]/10 flex items-center justify-center shrink-0">
        <ShieldAlert className="w-6 h-6 text-[#16845B]" />
      </div>
      <div className="flex-1">
        <h4 className="font-heading font-bold text-sm text-[#105C42] flex items-center gap-2">
          <span>{t('safety_disclaimer_title')}</span>
          <span className="bg-[#16845B]/15 text-[#16845B] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
            Safety Standard
          </span>
        </h4>
        <p className="text-xs text-[#526359] mt-1 leading-relaxed">
          {t('safety_disclaimer_text')}
        </p>
      </div>
    </div>
  );
};
