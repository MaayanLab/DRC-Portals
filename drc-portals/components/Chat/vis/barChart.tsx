import {
	BarChart, Bar, Cell, XAxis, YAxis, LabelList, Tooltip, ResponsiveContainer, TooltipProps
} from 'recharts';
import Color from 'color'

const renderCustomizedLabel = (props:any) => {
	const {
	  x, y, width, height, value, color
	} = props;
	// const radius = 10;
	const background = Color(color)
	const fontColor = "#000"
	const transfomedX = width < 0 ? x-15: x+15
	const textAnchor = width < 0 ? "end": "start"
	return (
	  <g>
		<text x={transfomedX} y={y+(height/2) + 4} width={width} fill={fontColor} textAnchor={textAnchor} fontSize={11}>
		  {value}
		</text>
	  </g>
	);
  };


export const BarChartComponent = ({data, color, neg=false}:{neg: boolean, color: string, data:Array<{[key:string]: number | string}>}) => {	
	const data_sorted = data.sort((a,b)=>neg?b.rank as number-(a.rank as number): a.rank as number-(b.rank as number))
	const data_slice = data_sorted.slice(0, 10)
	const width = 450
	return (
		
			<BarChart
				layout="vertical"
				id="bar"
				height={300}
				width={width}
				data={data_slice}// Save the ref of the chart
			>
				<Bar dataKey={data[0].zscore ? 'zscore': "z-sum"} fill={color} barSize={23}>
					<LabelList dataKey="local_id" position="inside" content={(props:any) => renderCustomizedLabel(props)} fill={"#000"}/>
					{data_slice.map((entry, index) => {
						return <Cell key={`bar-${index}`}/>
					}
					)}
				</Bar>
				<XAxis type="number" hide/>
				<YAxis type="category" hide/>
			</BarChart>
	)
}

export default BarChartComponent