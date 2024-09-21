import React, { useState} from "react";
import {RequestTab} from "@/components/RequestTab";
import {QueueTab} from "@/components/QueueTab";

const AutoscaleSampleApp = () => {
    const [activeTab, setActiveTab] = useState('Request');
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
            height: '100vh',
            fontSize: '20px'
        }}>

            <div style={{textAlign: 'center', maxWidth: '800px', fontSize: '20px'}}>
                <h1 className={"font-bold"} style={{fontSize: '30px'}}>Autoscale Sample App</h1>
                <br/>
                <div className={'mb-4'} style={{display: 'flex', gap: '5px', justifyContent: 'center'}}>
                    {/* Tab Navigation */}
                    <button
                        className={`px-4 py-2 ${activeTab === 'Request' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'} rounded`}
                        onClick={() => setActiveTab('Request')}
                    >
                        Request
                    </button>
                    <button
                        className={`px-4 py-2 ${activeTab === 'Queue' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'} rounded`}
                        onClick={() => setActiveTab('Queue')}
                    >
                        Queue
                    </button>
                </div>
                {/* Tab Content */}

                {activeTab === 'Request'
                    ? (<RequestTab/>)
                    : (<QueueTab/>)
                }
            </div>
        </div>
    );
};

export default AutoscaleSampleApp;
