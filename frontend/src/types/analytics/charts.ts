export interface ChartDataset {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
}

export interface LineChartData {
    labels: string[];
    datasets: ChartDataset[];
}

export interface PieChartData {
    labels: string[];
    data: number[];
    colors: string[];
}

export interface BarChartData {
    labels: string[];
    datasets: ChartDataset[];
}
