import React, { RefObject, useEffect, useRef, useState } from 'react'
import s from "./PageModal.module.css";
import cn from "classnames";
import plusImg from "../../assets/img/thinPlus.svg";
import PreloaderHorizontal from '../preloaderHorizontal/PreloaderHorizontal'
import { IoMdClose, IoIosArrowDown } from 'react-icons/io'



const onscrollTargetVisible = () => {

	const target = document.querySelector('.' + s.scrollDownTrigger)
	const onScrollContainer = document.querySelector('.' + s.modalBody)
	const scrollDown = document.querySelector('.' + s.scrollDown)

	if (target && scrollDown && onScrollContainer) {
		if (onScrollContainer instanceof HTMLElement) {

			let targetPosition = {
				top: onScrollContainer.offsetTop + target.getBoundingClientRect().top - onScrollContainer.getBoundingClientRect().top
			},
				windowPosition = {
					top: onScrollContainer.offsetTop + onScrollContainer.offsetHeight
				}

			if (targetPosition.top < windowPosition.top) {
				scrollDown.classList.remove(s.canSee)
			} else {
				scrollDown.classList.add(s.canSee)
			}
		}
	}
}




type pageModalType = {
	handleClose: () => void | false;
	isTop?: boolean;
};
const PageModal: React.FC<pageModalType> = ({ handleClose, isTop, children }) => {

	document.querySelector("body").style.overflowY = "hidden";

	const handleClick = () => {
		document.querySelector("body").style.overflowY = "auto";
		handleClose();
	};

	useEffect(() => {
		onscrollTargetVisible()
	})

	return (
		<div className={s.modal}>
			<div className={cn(s.modalOverlay, isTop ? s.login : s.normal)} onClick={handleClick} />
			<div onScroll={onscrollTargetVisible} className={cn(s.modalBody, isTop ? s.login : s.normal)}>
				{children}
				<div className={s.scrollDown}>
					<IoIosArrowDown style={{ width: "20px", height: "20px" }} />
				</div>
			</div>
		</div>
	);
};

type pageModalHeaderType = {
	title: string;
	handleClose: any;
	preloader?: boolean
};
export const PageModalHeader: React.FC<pageModalHeaderType> = ({
	title,
	handleClose,
	children,
	preloader = false
}) => {

	useEffect(() => {
		onscrollTargetVisible()
	})

	document.querySelector("body").style.overflowY = "hidden";

	const handleClick = () => {
		document.querySelector("body").style.overflowY = "auto";
		handleClose();
	};

	return (
		<div className={s.modalHeader}>
			{preloader &&
				<>
					<div className={s.preloaderContainer}>
						<PreloaderHorizontal />
					</div>
					<div className={s.preloaderOverlay} />
				</>
			}

			<div className={s.modalHeaderTopLine}>
				<h2>{title}</h2>
				{handleClose !== false &&
					<div onClick={handleClick} className={s.modalClose}>
						<IoMdClose style={{ width: "27px", height: "27px" }} />
					</div>
				}
			</div>
			<div className={s.modalHeaderOthers}>
				{children}
			</div>
		</div>
	);
};

type PageModalSearchType = {
	searchDefaultValue: string;
	searchPlaceholder: string;
	searchOnChange: (e: any) => void;
	searchOnSubmit: (e: any) => void;
};

export const PageModalSearch: React.FC<PageModalSearchType> = ({
	searchPlaceholder,
	searchDefaultValue,
	searchOnChange,
	searchOnSubmit,
}) => {
	return (
		<div className={s.modalSearchBar}>
			<form onSubmit={searchOnSubmit}>
				<input
					type="text"
					placeholder={searchPlaceholder}
					value={searchDefaultValue}
					onChange={searchOnChange}
				/>
			</form>
		</div>
	);
};

type buttonType = {
	title: string;
	type: "common" | "success" | "error";
	handleClick: any;
	disable?: boolean
};
type pageModalButtonsType = {
	buttons: Array<buttonType>;
};
export const PageModalButtons: React.FC<pageModalButtonsType> = ({
	buttons,
}) => {

	return (
		<div className={s.modalButtons}>
			{buttons.map((button) => {
				return (
					<button
						key={button.title}
						onClick={() => {
							if (button.disable === undefined || button.disable === false)
								button.handleClick()
						}}
						className={cn(s.button, s[button.type], { [s.disable]: button.disable })}
					>
						{button.title}
					</button>
				);
			})}
		</div>
	);
};

type PageModalPlusButtonType = {
	handleClick: any;
};
export const PageModalPlusButton: React.FC<PageModalPlusButtonType> = ({
	handleClick,
}) => {
	return (
		<button onClick={handleClick} className={s.modalPlusButton}>
			<img src={plusImg} alt="Add" />
		</button>
	);
};

export const PageModalContent: React.FC = ({ children }) => {
	return (
		<>
			<div className={s.modalContent}>{children}<div className={s.scrollDownTrigger} /></div>

		</>
	);
};

export default PageModal;
