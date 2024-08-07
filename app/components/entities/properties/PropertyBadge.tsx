import clsx from "clsx";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { Colors } from "~/application/enums/shared/Colors";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import SimpleBadge from "../../ui/badges/SimpleBadge";
import PaperClipIcon from "../../ui/icons/PaperClipIcon";
import ExperimentIconFilled from "~/components/ui/icons/tests/ExperimentIconFilled";

interface Props {
  title?: string;
  type: PropertyType;
  className?: string;
}

export default function PropertyBadge({ title, type, className }: Props) {
  return (
    <>
      {title ? (
        <SimpleBadge title={title} color={Colors.ORANGE} />
      ) : [PropertyType.NUMBER, PropertyType.RANGE_NUMBER].includes(type) ? (
        <svg xmlns="http://www.w3.org/2000/svg" className={clsx(className, "h-5 w-5 flex-shrink-0")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ) : [PropertyType.DATE, PropertyType.RANGE_DATE].includes(type) ? (
        <svg xmlns="http://www.w3.org/2000/svg" className={clsx(className, "h-5 w-5 flex-shrink-0")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ) : type === PropertyType.TEXT ? (
        <svg
          className={clsx(className, "h-5 w-5 flex-shrink-0")}
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="24"
          height="24"
          viewBox="0 0 172 172"
          fill="currentColor"
        >
          <g
            fill="none"
            fillRule="nonzero"
            stroke="none"
            strokeWidth="1"
            strokeLinecap="butt"
            strokeLinejoin="miter"
            strokeMiterlimit="10"
            strokeDasharray=""
            strokeDashoffset="0"
            fontFamily="none"
            fontWeight="none"
            fontSize="none"
            textAnchor="none"
          >
            <path d="M0,172v-172h172v172z" fill="none"></path>
            <g fill="currentColor">
              <path d="M146.59473,57.24935c-5.28183,0 -9.90758,1.23715 -13.89941,3.69531c-3.98467,2.451 -7.04629,5.9742 -9.19629,10.56803c-2.14283,4.59384 -3.2194,9.90187 -3.2194,15.92904v3.83528c0,9.44567 2.33353,16.88702 6.9847,22.29785c4.65117,5.41083 11.04261,8.11849 19.16244,8.11849c7.42467,0 13.40816,-1.93175 17.94466,-5.80892c4.5365,-3.87717 7.05009,-9.19203 7.54459,-15.94304v-0.014h-13.03157c-0.29383,3.81983 -1.4442,6.6341 -3.42936,8.45443c-1.98517,1.8275 -4.99348,2.74349 -9.02832,2.74349c-4.46483,0 -7.74101,-1.5573 -9.81218,-4.68913c-2.07117,-3.12467 -3.10742,-8.08556 -3.10742,-14.86523v-4.73112c0.05733,-6.48583 1.16705,-11.2725 3.33138,-14.36133c2.16433,-3.08883 5.40602,-4.63314 9.75618,-4.63314c4.00617,0 6.98784,0.92316 8.94434,2.74349c1.96367,1.82033 3.10686,4.7552 3.42936,8.80436h13.04557c-0.69517,-7.009 -3.27573,-12.4438 -7.74056,-16.32096c-4.46483,-3.87717 -10.36871,-5.82292 -17.67871,-5.82292zM23.58561,58.11719l-23.58561,62.70833h13.88542l4.35319,-12.91959h22.87174l4.40918,12.91959h13.87142l-23.71159,-62.70833zM65.31185,58.11719v62.70833h24.63542c7.19533,-0.05733 12.73058,-1.64195 16.61491,-4.74511c3.8915,-3.10317 5.83691,-7.66229 5.83691,-13.68946c0,-3.53317 -0.94298,-6.52167 -2.81348,-8.95833c-1.8705,-2.43667 -4.43807,-4.06842 -7.68457,-4.87109c2.84517,-1.08933 5.06459,-2.79355 6.66276,-5.13705c1.59816,-2.3435 2.39355,-5.04399 2.39355,-8.11849c0,-5.62583 -1.98539,-9.90478 -5.96289,-12.82161c-3.9775,-2.91683 -9.80692,-4.36719 -17.49675,-4.36719zM78.35742,68.58724h9.1403c3.59767,0 6.2247,0.61465 7.89453,1.86165c1.66983,1.247 2.50553,3.29969 2.50553,6.14486c0,5.08117 -3.29599,7.68189 -9.88216,7.79655h-9.6582zM29.63249,73.96224l7.96452,23.47364h-15.84505zM78.35742,93.5306h11.96777c6.00567,0.086 9.00032,2.99387 9.00032,8.73438c0,2.55133 -0.86235,4.55722 -2.58952,6.00489c-1.72717,1.44767 -4.12016,2.16959 -7.19466,2.16959h-11.18392z"></path>
            </g>
          </g>
        </svg>
      ) : type === PropertyType.BOOLEAN ? (
        <CheckIcon className={clsx(className, "h-5 w-5 flex-shrink-0")} />
      ) : type === PropertyType.SELECT || type === PropertyType.MULTI_SELECT || type === PropertyType.MULTI_TEXT ? (
        <svg
          className={clsx(className, "h-5 w-5 flex-shrink-0")}
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="24"
          height="24"
          viewBox="0 0 172 172"
          fill="currentColor"
        >
          <g
            fill="none"
            fillRule="nonzero"
            stroke="none"
            strokeWidth="1"
            strokeLinecap="butt"
            strokeLinejoin="miter"
            strokeMiterlimit="10"
            strokeDasharray=""
            strokeDashoffset="0"
            fontFamily="none"
            fontWeight="none"
            fontSize="none"
            textAnchor="none"
          >
            <path d="M0,172v-172h172v172z" fill="none"></path>
            <g fill="currentColor">
              <path d="M21.5,43v14.33333h129v-14.33333zM21.5,71.66667v14.33333h129v-14.33333zM21.5,100.33333v14.33333h129v-14.33333zM64.5,129l21.5,21.5l21.5,-21.5z"></path>
            </g>
          </g>
        </svg>
      ) : type === PropertyType.MEDIA ? (
        <PaperClipIcon className={clsx(className, "h-5 w-5 flex-shrink-0")} />
      ) : type === PropertyType.FORMULA ? (
        <ExperimentIconFilled className={clsx(className, "h-5 w-5 flex-shrink-0")} />
      ) : (
        <div></div>
      )}
    </>
  );
}
