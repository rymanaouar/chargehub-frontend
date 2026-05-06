import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, Car, CheckCircle2, AlertCircle, Phone, Mail, MapPin, XCircle, Shield } from 'lucide-react';

interface VehicleVerificationProps {
  onVerificationComplete: () => void;
}

export function VehicleVerification({ onVerificationComplete }: VehicleVerificationProps) {
  const [step, setStep] = useState<'upload' | 'scan-failed' | 'manual-entry' | 'citizenship' | 'tesla-login' | 'service-client'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [matricule, setMatricule] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [isCitizen, setIsCitizen] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [teslaEmail, setTeslaEmail] = useState('');
  const [teslaPassword, setTeslaPassword] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsVerifying(true);

    try {
      const Tesseract = (window as any).Tesseract;

      if (!Tesseract) throw new Error('Tesseract not available');

      const imageUrl = URL.createObjectURL(file);
      const { data: { text } } = await Tesseract.recognize(imageUrl, 'fra+eng');
      URL.revokeObjectURL(imageUrl);

      console.log('OCR Text:', text);

      const cleanText = text.replace(/\s+/g, ' ').toUpperCase();

const matriculeMatch =
  cleanText.match(/[A-Z]{2}[-\s]?\d{3}[-\s]?[A-Z]{2}/) ||
  cleanText.match(/\d{1,4}\s?[A-Z]{1,3}\s?\d{1,4}/);

// VIN: be flexible with OCR errors (0/O confusion, 1/I confusion)
const vinMatch =
  cleanText.match(/VF[A-Z0-9]{15}/) ||
  cleanText.match(/[A-Z0-9]{17}(?=\s|$)/) ||
  // Look for the bottom barcode line which is more reliable
  cleanText.match(/CRFRAAB[A-Z0-9]+/) ||
  cleanText.match(/[A-Z]{2}[A-Z0-9]{15}/);
      const modelMatch = text.match(/MODEL\s*[3SXY]|CYBERTRUCK|ROADSTER/i);

      if (matriculeMatch) setMatricule(matriculeMatch[0].replace(/\s/g, '-').toUpperCase());
      if (vinMatch) setChassisNumber(vinMatch[0]);

      if (modelMatch) {
        const modelMap: Record<string, string> = {
          'MODEL 3': 'model-3', 'MODEL3': 'model-3',
          'MODEL S': 'model-s', 'MODELS': 'model-s',
          'MODEL X': 'model-x', 'MODELX': 'model-x',
          'MODEL Y': 'model-y', 'MODELY': 'model-y',
          'CYBERTRUCK': 'cybertruck', 'ROADSTER': 'roadster',
        };

        const key = modelMatch[0].replace(/\s+/g, ' ').toUpperCase();
        setVehicleModel(modelMap[key] || 'model-3');
      } else {
        setVehicleModel('model-3');
      }
setIsVerifying(false);
      if (matriculeMatch || vinMatch) {
        setStep('citizenship');
      } else {
        // Nothing found — go to manual entry
        setStep('scan-failed');
      }

    } catch (err) {
      console.error('OCR error:', err);
      setIsVerifying(false);
      setStep('scan-failed');
    }
  }
  const handleManualVerification = () => {
    if (chassisNumber && matricule && vehicleModel) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        setStep('citizenship');
      }, 1500);
    }
  };

  const handleCitizenshipCheck = () => {
    if (isCitizen === 'yes') setStep('tesla-login');
    else if (isCitizen === 'no') setStep('service-client');
  };

  const handleTeslaLogin = () => {
    if (teslaEmail && teslaPassword) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        onVerificationComplete();
      }, 2000);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-2xl">

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${
            step === 'upload' || step === 'scan-failed' || step === 'manual-entry' ? 'text-[#171a20]' : 'text-[#5c5e62]'
          }`}>
            <div className={`size-8 rounded-full flex items-center justify-center ${
              step === 'upload' || step === 'scan-failed' || step === 'manual-entry'
                ? 'bg-[#171a20] text-white' : 'bg-[#5c5e62] text-white'
            }`}>
              {step !== 'upload' && step !== 'scan-failed' && step !== 'manual-entry'
                ? <CheckCircle2 className="size-5" /> : '1'}
            </div>
            <span className="text-sm font-medium">Carte Grise</span>
          </div>
          <div className="h-px w-12 bg-[#e8e8e8]" />
          <div className={`flex items-center gap-2 ${
            step === 'citizenship' ? 'text-[#171a20]' :
            step === 'tesla-login' || step === 'service-client' ? 'text-[#5c5e62]' : 'text-[#a0a0a0]'
          }`}>
            <div className={`size-8 rounded-full flex items-center justify-center ${
              step === 'citizenship' ? 'bg-[#171a20] text-white' :
              step === 'tesla-login' || step === 'service-client' ? 'bg-[#5c5e62] text-white' :
              'bg-[#f4f4f4] text-[#a0a0a0]'
            }`}>
              {step === 'tesla-login' || step === 'service-client'
                ? <CheckCircle2 className="size-5" /> : '2'}
            </div>
            <span className="text-sm font-medium">Citoyenneté</span>
          </div>
          <div className="h-px w-12 bg-[#e8e8e8]" />
          <div className={`flex items-center gap-2 ${step === 'tesla-login' ? 'text-[#171a20]' : 'text-[#a0a0a0]'}`}>
            <div className={`size-8 rounded-full flex items-center justify-center ${
              step === 'tesla-login' ? 'bg-[#171a20] text-white' : 'bg-[#f4f4f4] text-[#a0a0a0]'
            }`}>
              3
            </div>
            <span className="text-sm font-medium">Connexion Tesla</span>
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <Card className="shadow-lg border-[#e8e8e8]">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-[#f4f4f4] p-4 rounded">
                  <Upload className="size-8 text-[#171a20]" />
                </div>
              </div>
              <CardTitle>Scanner votre Carte Grise</CardTitle>
              <CardDescription>
                Téléchargez une photo claire de votre carte grise — l'OCR extraira automatiquement vos informations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-[#e8e8e8] rounded p-8 text-center hover:border-[#171a20] transition-colors cursor-pointer">
                <input
                  type="file"
                  id="carte-grise"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isVerifying}
                />
                <label htmlFor="carte-grise" className="cursor-pointer">
                  <Upload className="size-12 mx-auto text-[#5c5e62] mb-4" />
                  <p className="text-sm font-medium mb-2">
                    Cliquez pour télécharger ou glissez votre fichier ici
                  </p>
                  <p className="text-xs text-[#5c5e62]">PNG, JPG ou PDF jusqu'à 10MB</p>
                </label>
              </div>

              {uploadedFile && isVerifying && (
                <Alert className="bg-[#f4f4f4] border-[#e8e8e8]">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin size-4 border-2 border-[#171a20] border-t-transparent rounded-full" />
                    <AlertDescription className="text-[#171a20]">
                      Lecture OCR en cours — cela peut prendre 10 à 20 secondes...
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              <div className="bg-[#f4f4f4] border border-[#e8e8e8] rounded p-4">
                <div className="flex gap-3">
                  <AlertCircle className="size-5 text-[#5c5e62] shrink-0 mt-0.5" />
                  <div className="text-sm text-[#171a20]">
                    <p className="font-semibold mb-1">Conseils pour une meilleure reconnaissance :</p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-[#5c5e62]">
                      <li>Assurez-vous que le document est bien éclairé</li>
                      <li>Évitez les reflets et les ombres</li>
                      <li>Le texte doit être net et lisible</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scan Failed */}
        {step === 'scan-failed' && (
          <Card className="shadow-lg border-[#e82127]">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-50 p-4 rounded">
                  <XCircle className="size-8 text-[#e82127]" />
                </div>
              </div>
              <CardTitle>Échec de la reconnaissance</CardTitle>
              <CardDescription>Nous n'avons pas pu lire votre carte grise automatiquement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-red-50 border-[#e82127]">
                <XCircle className="size-4 text-[#e82127]" />
                <AlertDescription className="text-[#171a20]">
                  La qualité de l'image est insuffisante. Veuillez saisir vos informations manuellement.
                </AlertDescription>
              </Alert>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('upload')} className="flex-1">
                  Réessayer le scan
                </Button>
                <Button onClick={() => setStep('manual-entry')} className="flex-1 bg-[#171a20] hover:bg-[#171a20]/90">
                  Saisie manuelle
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Entry */}
        {step === 'manual-entry' && (
          <Card className="shadow-lg border-[#e8e8e8]">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-[#f4f4f4] p-4 rounded">
                  <Car className="size-8 text-[#171a20]" />
                </div>
              </div>
              <CardTitle>Vérification Manuelle</CardTitle>
              <CardDescription>Saisissez votre numéro de châssis et matricule pour continuer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="chassis">Numéro de Châssis (VIN) *</Label>
                  <Input
                    id="chassis"
                    placeholder="5YJ3E1EA1KF000000"
                    value={chassisNumber}
                    onChange={e => setChassisNumber(e.target.value.toUpperCase())}
                    className="text-sm font-mono"
                    maxLength={17}
                  />
                  <p className="text-xs text-[#5c5e62]">17 caractères - Trouvable sur la carte grise (champ E)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matricule">Numéro de Matricule *</Label>
                  <Input
                    id="matricule"
                    placeholder="123-TU-4567"
                    value={matricule}
                    onChange={e => setMatricule(e.target.value.toUpperCase())}
                    className="text-lg font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modèle Tesla *</Label>
                  <select
                    id="model"
                    value={vehicleModel}
                    onChange={e => setVehicleModel(e.target.value)}
                    className="w-full h-10 px-3 rounded border border-[#e8e8e8] bg-white text-sm"
                  >
                    <option value="">Sélectionner votre modèle</option>
                    <option value="model-s">Model S</option>
                    <option value="model-3">Model 3</option>
                    <option value="model-x">Model X</option>
                    <option value="model-y">Model Y</option>
                    <option value="cybertruck">Cybertruck</option>
                    <option value="roadster">Roadster</option>
                  </select>
                </div>
              </div>

              {isVerifying && (
                <Alert className="bg-[#f4f4f4] border-[#e8e8e8]">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin size-4 border-2 border-[#171a20] border-t-transparent rounded-full" />
                    <AlertDescription className="text-[#171a20]">Vérification des informations...</AlertDescription>
                  </div>
                </Alert>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep('scan-failed')} className="flex-1" disabled={isVerifying}>
                  Retour
                </Button>
                <Button
                  onClick={handleManualVerification}
                  disabled={!chassisNumber || !matricule || !vehicleModel || isVerifying}
                  className="flex-1 bg-[#171a20] hover:bg-[#171a20]/90"
                >
                  Vérifier
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Citizenship */}
        {step === 'citizenship' && (
          <Card className="shadow-lg border-[#e8e8e8]">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-[#f4f4f4] p-4 rounded">
                  <Shield className="size-8 text-[#171a20]" />
                </div>
              </div>
              <CardTitle>Vérification de la Citoyenneté</CardTitle>
              <CardDescription>Veuillez confirmer votre statut de résidence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-[#f4f4f4] border-[#e8e8e8]">
                <CheckCircle2 className="size-4 text-[#171a20]" />
                <AlertDescription className="text-[#171a20]">
                  <strong>Véhicule identifié :</strong> Tesla {vehicleModel.replace(/-/g, ' ').toUpperCase()} • {matricule}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Êtes-vous citoyen de l'Union Européenne ? *</Label>
                <RadioGroup value={isCitizen} onValueChange={setIsCitizen} className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes" className="text-sm font-normal cursor-pointer">Oui, je suis citoyen de l'UE</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no" className="text-sm font-normal cursor-pointer">Non, je ne suis pas citoyen de l'UE</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                onClick={handleCitizenshipCheck}
                disabled={!isCitizen}
                className="w-full bg-[#171a20] hover:bg-[#171a20]/90"
              >
                Continuer
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tesla Login */}
        {step === 'tesla-login' && (
          <Card className="shadow-lg border-[#e8e8e8]">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <svg className="h-12 w-auto" viewBox="0 0 342 35" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 .1a9.7 9.7 0 0 0 7 7h11l.5.1v27.6h6.8V7.3L26 7h11a9.8 9.8 0 0 0 7-7H0zm238.6 0h-6.8v34.8H263a9.7 9.7 0 0 0 6-6.8h-30.3V0zm-52.3 6.8c3.6-1 6.6-3.8 7.4-6.9l-38.1.1v20.6h31.1v7.2h-24.4a13.6 13.6 0 0 0-8.7 7h39.9v-21h-31.2v-7h24zm116.2 28h6.7v-14h24.6v14h6.7v-21h-38zM85.3 7h26a9.6 9.6 0 0 0 7.1-7H78.3a9.6 9.6 0 0 0 7 7zm0 13.8h26a9.6 9.6 0 0 0 7.1-7H78.3a9.6 9.6 0 0 0 7 7zm0 14.1h26a9.6 9.6 0 0 0 7.1-7H78.3a9.6 9.6 0 0 0 7 7zM308.5 7h26a9.6 9.6 0 0 0 7-7h-40a9.6 9.6 0 0 0 7 7z" fill="#171a20"/>
                </svg>
              </div>
              <CardTitle>Connexion à votre compte Tesla</CardTitle>
              <CardDescription>Connectez-vous pour accéder aux données de votre véhicule via l'API Teslascope</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-[#f4f4f4] border-[#e8e8e8]">
                <CheckCircle2 className="size-4 text-[#171a20]" />
                <AlertDescription className="text-[#171a20]">
                  <strong>Véhicule identifié :</strong> Tesla {vehicleModel.replace(/-/g, ' ').toUpperCase()} • {matricule}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tesla-email">Email Tesla *</Label>
                  <Input
                    id="tesla-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={teslaEmail}
                    onChange={e => setTeslaEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tesla-password">Mot de passe *</Label>
                  <Input
                    id="tesla-password"
                    type="password"
                    placeholder="••••••••"
                    value={teslaPassword}
                    onChange={e => setTeslaPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <div className="flex gap-3">
                  <AlertCircle className="size-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Connexion sécurisée</p>
                    <p className="text-xs">Vos identifiants Tesla sont utilisés uniquement pour accéder aux données de votre véhicule via l'API Teslascope. Ils ne sont jamais stockés.</p>
                  </div>
                </div>
              </div>

              {isVerifying && (
                <Alert className="bg-[#f4f4f4] border-[#e8e8e8]">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin size-4 border-2 border-[#171a20] border-t-transparent rounded-full" />
                    <AlertDescription className="text-[#171a20]">Connexion à l'API Teslascope en cours...</AlertDescription>
                  </div>
                </Alert>
              )}

              <Button
                onClick={handleTeslaLogin}
                disabled={!teslaEmail || !teslaPassword || isVerifying}
                className="w-full bg-[#171a20] hover:bg-[#171a20]/90"
              >
                {isVerifying ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Service Client */}
        {step === 'service-client' && (
          <Card className="shadow-lg border-2 border-[#e82127]">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-50 p-4 rounded">
                  <AlertCircle className="size-8 text-[#e82127]" />
                </div>
              </div>
              <CardTitle>Vérification Impossible</CardTitle>
              <CardDescription>Contactez notre service client pour valider votre accès</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-red-50 border-[#e82127]">
                <AlertCircle className="size-4 text-[#e82127]" />
                <AlertDescription className="text-[#171a20]">
                  Nous n'avons pas pu vérifier automatiquement vos informations. Notre équipe de support est là pour vous aider.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="border rounded p-4 hover:bg-[#f4f4f4] transition-colors">
                  <div className="flex items-start gap-3">
                    <Phone className="size-5 text-[#e82127] shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Téléphone</p>
                      <p className="text-sm text-[#5c5e62]">+216 71 000 000</p>
                      <p className="text-xs text-[#5c5e62] mt-1">Lundi - Vendredi : 9h - 18h</p>
                    </div>
                  </div>
                </div>
                <div className="border rounded p-4 hover:bg-[#f4f4f4] transition-colors">
                  <div className="flex items-start gap-3">
                    <Mail className="size-5 text-[#e82127] shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-sm text-[#5c5e62]">support@chargerhub.tn</p>
                      <p className="text-xs text-[#5c5e62] mt-1">Réponse sous 24h ouvrées</p>
                    </div>
                  </div>
                </div>
                <div className="border rounded p-4 hover:bg-[#f4f4f4] transition-colors">
                  <div className="flex items-start gap-3">
                    <MapPin className="size-5 text-[#e82127] shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Centre d'Assistance</p>
                      <p className="text-sm text-[#5c5e62]">Avenue Mohamed V, Sousse</p>
                      <p className="text-sm text-[#5c5e62]">4000 Sousse, Tunisie</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-sm text-blue-900">
                  <strong>Documents requis :</strong> Carte grise du véhicule, pièce d'identité, justificatif de domicile.
                </p>
              </div>

              <Button variant="outline" onClick={() => setStep('manual-entry')} className="w-full">
                Retour
              </Button>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}