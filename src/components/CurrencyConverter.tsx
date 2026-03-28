import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { formatINR } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const CurrencyConverter = () => {
  const [usdInput, setUsdInput] = useState('');
  const { toast } = useToast();
  const { inr, loading, error, convert } = useCurrencyConverter(0);

  const handleConvert = async () => {
    const usd = parseFloat(usdInput);
    if (isNaN(usd) || usd <= 0) {
      toast({ title: 'Invalid amount', description: 'Please enter a positive USD amount.' });
      return;
    }
    try {
      const resultInr = await convert(usd);
      toast({ title: 'Converted!', description: `${formatINR(resultInr)} INR` });
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>USD to INR Converter</CardTitle>
          <CardDescription>Convert US Dollars to Indian Rupees (Rate: 83.5)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="usd">USD Amount</Label>
            <Input
              id="usd"
              type="number"
              placeholder="0.00"
              value={usdInput}
              onChange={(e) => setUsdInput(e.target.value)}
              className="w-full"
            />
          </div>
          <Button onClick={handleConvert} className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              'Convert'
            )}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold">{formatINR(inr)}</p>
            <p className="text-sm text-muted-foreground">
              {usdInput ? `${usdInput} USD` : 'Enter amount to preview'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrencyConverter;

