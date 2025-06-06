import React, { useState } from 'react'
import { Wallet2 } from 'lucide-react'
import { useAppKit } from '@reown/appkit/react'
import { useAccount } from 'wagmi'
import { shortenAddress } from '../../utils/libs'

export function ConnectButton() {
  const [isHovering, setIsHovering] = useState(false)
  // Assuming darkMode is defined elsewhere and passed as a prop
  const { open } = useAppKit();
  const { isConnected, isConnecting, address } = useAccount();

  return (
    <button
        onClick={open}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`
          relative group
          px-4 sm:px-6 py-1 sm:py-1 rounded-lg
          transform transition-all duration-300
          ${isConnecting ? 'scale-[0.98]' : isHovering ? 'scale-[1.02]' : 'scale-100'}
          ${isConnected
            ? 'bg-white dark:bg-slate-800 border border-emerald-500/50'
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
          }
          ${isConnecting ? '' : 'hover:border-opacity-100'}
          shadow-sm
          w-[calc(100%-2rem)] sm:w-auto max-w-sm mx-4 sm:mx-0
        `}
        disabled={isConnecting}
      >
        <div className="flex items-center gap-2 sm:gap-3 justify-center">
          <div className={`
            relative
            w-6 h-6 sm:w-8 sm:h-8 rounded-md
            flex items-center justify-center
            transition-colors duration-300
            ${isConnected
              ? 'bg-emerald-50 dark:bg-emerald-500/10'
              : 'bg-slate-100 dark:bg-slate-700/50'
            }
            ${isConnecting ? 'animate-pulse' : ''}
          `}>
            <Wallet2 
              className={`
                w-4 h-4 sm:w-5 sm:h-5
                transition-all duration-300
                ${isConnected
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400'
                }
              `}
            />
          </div>
          <span className={`
            text-sm sm:text-base font-medium
            transition-colors duration-300
            ${isConnected
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-700 dark:text-slate-300'
            }
          `}>
            {isConnected 
              ? shortenAddress(address) 
              : isConnecting 
                ? 'Connecting...' 
                : 'Connect Wallet'}
          </span>
        </div>

        {/* Subtle loading indicator */}
        {isConnecting && (
          <div className="absolute inset-x-0 bottom-0 h-0.5">
            <div className="h-full animate-[loading_1s_ease-in-out_infinite] bg-slate-300 dark:bg-slate-600" />
          </div>
        )}

        {/* Success indicator */}
        {isConnected && (
          <div className="absolute -right-1 -top-1 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
        )}
      </button>
  )
}