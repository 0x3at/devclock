'use client';
import React, { createContext, useContext, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';

interface AppContextType {
	dateRange: DateRange | undefined;
	setDateRange: (range: DateRange | undefined) => void;
	currentView: string;
	setCurrentView: (activity: string) => void;
	interactiveChartType: string;
	setInteractiveChartType: (type: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: addDays(new Date(), -7),
		to: new Date(),
	});
	const [currentView, setCurrentView] = useState<string>(`Overview`);
	const [interactiveChartType, setInteractiveChartType] =
		useState<string>('bar');
	return (
		<AppContext.Provider
			value={{
				dateRange,
				setDateRange,
				currentView,
				setCurrentView,
				interactiveChartType,
				setInteractiveChartType,
			}}>
			{children}
		</AppContext.Provider>
	);
}

export function useAppContext() {
	const appContext = useContext(AppContext);
	if (!appContext) {
		throw new Error('Error:ContextNotFound');
	}
	return appContext;
}
