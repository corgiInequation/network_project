interface singleData{
    UpdateTime:string,
    Value:number
}

export interface deviceData{
    Altitude:singleData,
    Pressure:singleData,
    Temprature:singleData
}

export interface deviceInfo{
    ClientID:string,
    ConnectionTime:string,
    IPAddress:string,
    SessionActive:number,
    Username:string
}


