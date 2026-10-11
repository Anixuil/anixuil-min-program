import { init, use, type ComposeOption } from "echarts/core";
import { BarChart, PieChart, type BarSeriesOption, type PieSeriesOption } from "echarts/charts";
import {
  AriaComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  type AriaComponentOption,
  type GridComponentOption,
  type LegendComponentOption,
  type TooltipComponentOption,
} from "echarts/components";
import { LabelLayout } from "echarts/features";
import { SVGRenderer } from "echarts/renderers";

use([BarChart, PieChart, AriaComponent, GridComponent, LegendComponent, TooltipComponent, LabelLayout, SVGRenderer]);

export type AdminChartOption = ComposeOption<
  BarSeriesOption | PieSeriesOption | AriaComponentOption | GridComponentOption | LegendComponentOption | TooltipComponentOption
>;

export function createChart(element: HTMLElement) {
  return init(element, undefined, { renderer: "svg" });
}

export type AdminChartInstance = ReturnType<typeof createChart>;
