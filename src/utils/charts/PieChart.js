import { useEffect, useState } from 'react';
import ReactEcharts from 'echarts-for-react';


const PieChart = ({data,colorMap}) => {

    const [options, setOptions] = useState(null);

    useEffect(() => {

        const formattedData = Object.keys(data).map((key,index) => (
            {value : data[key],name : key}
        ))

        

        const option = {
            tooltip: {
              trigger: 'item',
              formatter: function (params) {
                const { name, percent } = params;
                return `<span class="me-2">${name}</span>   <span class="font-bold">${percent}%</span>`;
              }
            },
            legend: {
                orient : 'vertical',
            //   right: '5%',
                right: '0',
                bottom : '20%'
            },
            series: [
              {
                name: 'Emotion',
                type: 'pie',
                radius: ['50%', '65%'],
                center : ['25%','50%'],
                avoidLabelOverlap: false,
                itemStyle: {
                  borderRadius: 6,
                  borderColor: '#fff',
                  borderWidth: 2
                },
                label: {
                  show: false,
                  position: 'center'
                },
                // emphasis: {
                //   label: {
                //     show: true,
                //     fontSize: 20,
                //     fontWeight: 'bold'
                //   }
                // },
                labelLine: {
                  show: false
                },
                data: formattedData.slice().sort((a, b) => b.value - a.value),
                itemStyle: {
                    // Set color for each item based on category name
                    color: function (params) {
                        return colorMap[params.name] || '#999'; // Default color if name not found
                    }
                  }
              }
            ]
          };

        setOptions(option)
    }, [])


    return (
        <>

            {
                options &&
                <div
                    className='w-full'
                >
                    <ReactEcharts
                        option={options}
                        notMerge={true}
                        lazyUpdate={true}
                        style={{ width:'100%',height: '115px' }}
                         />
                </div>
            }

        </>
    );
}

export default PieChart;