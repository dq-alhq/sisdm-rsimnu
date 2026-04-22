'use client'

import { useMemo } from 'react'
import { Line, LineChart as LineChartPrimitive, type LineProps } from 'recharts'
import {
    type BaseChartProps,
    CartesianGrid,
    Chart,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    constructCategoryColors,
    DEFAULT_COLORS,
    getColorValue,
    valueToPercent,
    XAxis,
    YAxis
} from './chart'

export interface LineChartProps extends BaseChartProps {
    connectNulls?: boolean
    lineProps?: LineProps
    chartProps?: Omit<React.ComponentProps<typeof LineChartPrimitive>, 'data' | 'stackOffset'>
}

export function LineChart({
    data = [],
    dataKey,
    colors = DEFAULT_COLORS,
    connectNulls = false,
    type = 'default',
    config,
    children,

    // Components
    tooltip = true,
    tooltipProps,

    legend = true,
    legendProps,

    intervalType = 'equidistantPreserveStart',

    valueFormatter = (value: number) => value.toString(),

    // XAxis
    displayEdgeLabelsOnly = false,
    xAxisProps,
    hideXAxis = false,

    // YAxis
    yAxisProps,
    hideYAxis = false,

    hideGridLines = false,
    chartProps,
    lineProps,
    ...props
}: LineChartProps) {
    const configKeys = useMemo(() => Object.keys(config), [config])
    const categoryColors = useMemo(() => constructCategoryColors(configKeys, colors), [configKeys, colors])

    const configEntries = useMemo(() => Object.entries(config), [config])

    return (
        <Chart config={config} data={data} dataKey={dataKey} {...props}>
            {({ onLegendSelect, selectedLegend }) => (
                <LineChartPrimitive
                    data={data}
                    margin={{
                        bottom: 0,
                        left: 0,
                        right: 0,
                        top: 5
                    }}
                    onClick={() => {
                        onLegendSelect(null)
                    }}
                    stackOffset={type === 'percent' ? 'expand' : undefined}
                    {...chartProps}
                >
                    {!hideGridLines && <CartesianGrid strokeDasharray='4 4' />}
                    <XAxis
                        displayEdgeLabelsOnly={displayEdgeLabelsOnly}
                        hide={hideXAxis}
                        intervalType={intervalType}
                        {...xAxisProps}
                    />
                    <YAxis
                        hide={hideYAxis}
                        tickFormatter={type === 'percent' ? valueToPercent : valueFormatter}
                        {...yAxisProps}
                    />

                    {legend && (
                        <ChartLegend
                            content={typeof legend === 'boolean' ? <ChartLegendContent /> : legend}
                            {...legendProps}
                        />
                    )}

                    {tooltip && (
                        <ChartTooltip
                            content={
                                typeof tooltip === 'boolean' ? <ChartTooltipContent accessibilityLayer /> : tooltip
                            }
                            {...tooltipProps}
                        />
                    )}

                    {!children
                        ? configEntries.map(([category, values]) => {
                              const strokeOpacity = selectedLegend && selectedLegend !== category ? 0.1 : 1
                              const color = getColorValue(values.color || categoryColors.get(category))

                              return (
                                  <Line
                                      connectNulls={connectNulls}
                                      dataKey={category}
                                      dot={false}
                                      key={category}
                                      name={category}
                                      stroke={color}
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      style={
                                          {
                                              strokeOpacity,
                                              strokeWidth: 2,
                                              '--line-color': color
                                          } as React.CSSProperties
                                      }
                                      type='linear'
                                      {...lineProps}
                                  />
                              )
                          })
                        : children}
                </LineChartPrimitive>
            )}
        </Chart>
    )
}
