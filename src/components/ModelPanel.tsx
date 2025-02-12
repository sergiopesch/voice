import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { AIModel } from '@/types';
import { XMarkIcon } from '@heroicons/react/24/solid';

const models: AIModel[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    description: 'Most capable GPT-4 model, great for voice interactions.',
    maxTokens: 150,
    contextWindow: 8192,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Faster responses, good balance of capability and speed.',
    maxTokens: 150,
    contextWindow: 4096,
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    description: 'Google\'s advanced language model for voice interactions.',
    maxTokens: 150,
    contextWindow: 32768,
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'mistral',
    description: 'Mistral\'s most powerful model with excellent reasoning capabilities.',
    maxTokens: 150,
    contextWindow: 32768,
  },
  {
    id: 'mistral-medium',
    name: 'Mistral Medium',
    provider: 'mistral',
    description: 'Balanced performance and speed for everyday tasks.',
    maxTokens: 150,
    contextWindow: 32768,
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small',
    provider: 'mistral',
    description: 'Fast and efficient for simpler interactions.',
    maxTokens: 150,
    contextWindow: 32768,
  },
];

export const ModelPanel = () => {
  const { isModelPanelOpen, toggleModelPanel, selectedModel, setSelectedModel } = useStore();

  // Group models by provider
  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);

  return (
    <AnimatePresence>
      {isModelPanelOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg p-6 z-50 overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Select Model</h2>
            <button
              onClick={toggleModelPanel}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedModels).map(([provider, providerModels]) => (
              <div key={provider} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase">
                  {provider.charAt(0).toUpperCase() + provider.slice(1)} Models
                </h3>
                <div className="space-y-2">
                  {providerModels.map((model) => (
                    <motion.button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model);
                        toggleModelPanel();
                      }}
                      className={`w-full p-4 rounded-lg border ${
                        selectedModel?.id === model.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      } transition-all`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-left">
                        <h3 className="font-semibold">{model.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {model.description}
                        </p>
                        <div className="flex gap-2 mt-2 text-xs text-gray-500">
                          <span>Max Tokens: {model.maxTokens}</span>
                          {model.contextWindow && (
                            <span>• Context: {model.contextWindow} tokens</span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 