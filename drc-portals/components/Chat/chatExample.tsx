

export default function ChatExample({example, submit}: {example: string, submit: Function}) {
    return (
        <div
        data-te-chip-init
        data-te-ripple-init
        className="[word-wrap: break-word] my-[5px] mx-[5px] flex h-[32px] cursor-pointer items-center justify-between rounded-[16px] bg-[#eceff1] px-[12px] py-0 text-[13px] font-normal normal-case leading-loose text-[#4f4f4f] shadow-none transition-[opacity] duration-300 ease-linear hover:!shadow-none active:bg-[#cacfd1] dark:bg-neutral-600 dark:text-neutral-200"
        data-te-close="true"
        onClick={async (evt) => {
        evt.preventDefault()
        submit({
            role: 'user',
            content: example,
            output: null,
            options: null,
            args: null
        })
        }}
        >
        {example}
    </div>)
}