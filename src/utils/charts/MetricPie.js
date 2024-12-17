import { useEffect, useState } from 'react';
import ReactEcharts from 'echarts-for-react';

const MetricPie = ({data}) => {
    const [options, setOptions] = useState(null);

    useEffect(() => {
        const formattedData = {
            name: data.field,
            value: parseFloat(parseFloat(data.value).toFixed(2)),
            min: data.ideal_range.min,
            max: data.ideal_range.max,
            units: data.units
        }

        const option = {
            series: {
                type: 'gauge',
                // center: [`${(index + 1) * 18}%`, '50%'], // Adjust for multiple gauges in one row
                radius: '80%',
                // startAngle: 0,
                // endAngle: 360,
                min: 0, 
                max: Math.max(formattedData.max + (formattedData.max - formattedData.min) * 0.2, formattedData.value * 1.2), // Adjust for max value
                splitNumber: 4,
                itemStyle: {
                    color: '#0496ff'
                  },
                progress: {
                    show: true,
                    width: 12,
                    
                    
                  },
                axisLine: {
                    lineStyle: {
                        width: 12,
                        color: [
                            [formattedData.value, '#ced4da'], // Below ideal range
                           
                        ]
                    }
                },
                pointer: {
                    show:false,
                    itemStyle: {
                        color: 'auto'
                    }
                },
                axisTick: {
                    show:false,
                    distance: -2,
                    length: 8,
                    lineStyle: {
                        color: '#6c757d',
                        width: 2
                    }
                },
               
                splitLine: {
                    show:false,
                    distance: -2,
                    length: 8,
                    lineStyle: {
                        color: '#6c757d',
                        width: 1.5
                    }
                },
                axisLabel: {
                    show:false,
                    color: 'green',
                    distance: -20,
                    fontSize: 9,
                    rotate: 'tangential',
                    formatter: function (value) {
                        console.log(value)
                        if (value ===   formattedData.max) {
                          return 'Idle Range';
                        } else if (value === formattedData.min) {
                          return 'Not in Idle Range';
                        }else {
                            
                        return '';
                        }
                      }
                },
                title: {
                    show : false,
                    // textStyle: {
                    //     fontSize: 14,
                    //     color: 'red',
                    //     offsetCenter: [0, '90%'],
                    // }
                },
                detail: {
                    valueAnimation: true,
                    formatter: '{value} ' + formattedData.units,
                    color: 'black',
                    fontSize: 12,
                    fontWeight : "normal",
                    offsetCenter: [0, '100%'],
                },
                data: [
                    { value: formattedData.value, name: formattedData.name }
                ]
            }
        };

        setOptions(option);
    }, [data]);

    return (
        <>
            {
                options &&
                <div className='w-full h-full flex items-center '>
                    <ReactEcharts
                        option={options}
                        notMerge={true}
                        lazyUpdate={true}
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            }
        </>
    );
};

export default MetricPie;