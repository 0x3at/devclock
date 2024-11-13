import { MILLISECONDS_IN_SECOND } from "../../globalconstants";
import { SECONDS_IN_MINUTE } from "../../globalconstants";
import { MINUTES_IN_HOUR } from "../../globalconstants";
import { START_TIME } from "../../globalconstants";

type TimeUnits = {
    [key in 'm' | 'S' | 'M' | 'H']: () => number;
}

const TimeUnits:TimeUnits = {
    m: () => Date.now(),
    S: () => ToSeconds(Date.now()),
    M: () => ToMinutes(Date.now()),
    H: () => ToHours(Date.now())
};

type TimePipe<A, B> = (input: A) => B;
const convertTime = <A, B, C>(
    fn1: TimePipe<A, B>,
    fn2: TimePipe<B, C>
) => (input: A): C => fn2(fn1(input));

//* Capture Current Date
type CurrentTime = (option: keyof TimeUnits) => number;
export const CurrentTime:CurrentTime = (option) => TimeUnits[option]();

//* Capture Current Working Time
type CurrentWorkingTime = () => number;
export const CurrentWorkingMilliseconds:CurrentWorkingTime = () => CurrentTime('m') - START_TIME;
export const CurrentWorkingSeconds:CurrentWorkingTime = () => ToSeconds(CurrentTime('m') - START_TIME);
export const CurrentWorkingMinutes:CurrentWorkingTime = () => ToMinutes(CurrentTime('m') - START_TIME);
export const CurrentWorkingHours:CurrentWorkingTime = () => ToHours(CurrentTime('m') - START_TIME);

//* milliseconds -> seconds
type ToSeconds = (milliseconds:number) => number;
export const ToSeconds:ToSeconds = (milliseconds) => milliseconds > MILLISECONDS_IN_SECOND && milliseconds > 0 ? Math.trunc(milliseconds/MILLISECONDS_IN_SECOND): 0;

//* milliseconds -> minutes
type ToMinutes = (miliseconds:number) => number;
export const ToMinutes:ToMinutes = (milliseconds) => Math.trunc(ToSeconds(milliseconds)/SECONDS_IN_MINUTE);

//* milliseconds -> hours
type ToHours = (milliseconds:number) => number;
export const ToHours:ToHours = (milliseconds) => Math.trunc(ToMinutes(milliseconds)/MINUTES_IN_HOUR);

//* seconds -> milliseconds
type FromSeconds = (seconds: number) => number;
export const FromSeconds: FromSeconds = (seconds) => seconds * MILLISECONDS_IN_SECOND;

//* hours -> milliseconds
type FromHours = (hours: number) => number;
export const FromHours: FromHours = (hours) => FromMinutes(hours * MINUTES_IN_HOUR);

//* minutes -> milliseconds
type FromMinutes = (minutes: number) => number;
export const FromMinutes: FromMinutes = (minutes) => FromSeconds(minutes * SECONDS_IN_MINUTE);

//* hours -> minutes
export const FromHoursToMinutes = convertTime(FromHours, ToMinutes);

//* hours -> seconds
export const FromHoursToSeconds = convertTime(FromHours, ToSeconds);

//* minutes -> hours
export const FromMinutesToHours = convertTime(FromMinutes,ToHours);

//* minutes -> seconds
export const FromMinutesToSeconds = convertTime(FromMinutes, ToSeconds);

//* seconds -> Hours
export const FromSecondsToHours = convertTime(FromSeconds,ToHours);

//* seconds -> minutes
export const FromSecondsToMinutes = convertTime(FromSeconds,ToMinutes);

//* Milliseconds to timer timestamp HH:MM
type ToTimeStamp = (milliseconds:number) => number;
export const ToTimeStamp:ToTimeStamp = (milliseconds:number) =>
    ToHours(milliseconds)
    +((ToMinutes(milliseconds)
    -FromSecondsToMinutes(ToSeconds(milliseconds))) /100);